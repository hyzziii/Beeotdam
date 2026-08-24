/**
 * 기상청 단기예보 조회서비스를 앱이 쓰는 모양으로 옮긴다.
 *
 * 이 API의 응답은 화면과 형태가 전혀 다르다. 한 시각의 정보가 한 덩어리로 오지 않고
 * 항목마다 한 줄씩 흩어져 온다.
 *
 *   { category: 'POP', fcstTime: '1400', fcstValue: '85' }    강수확률
 *   { category: 'PCP', fcstTime: '1400', fcstValue: '7.5mm' } 강수량
 *   { category: 'TMP', fcstTime: '1400', fcstValue: '23' }    기온
 *
 * 그래서 시각별로 다시 묶는 작업이 이 파일의 대부분이다.
 */

import { GridPoint } from './grid';
import { fetchPublicData } from './http';
import { BaseTime, ultraSrtNcstBase, vilageFcstBase } from './kma-time';

const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

/** 실제 응답이 약 800줄(14개 항목 × 5일)이라 한 번에 다 받도록 넉넉히 잡는다. */
const VILAGE_FCST_ROWS = 1000;
const ULTRA_SRT_NCST_ROWS = 60;

/** 예보 응답 한 줄. */
interface FcstItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

/** 실황 응답 한 줄. 예보와 달리 fcst가 아니라 obsr이다. */
interface NcstItem {
  category: string;
  baseDate: string;
  baseTime: string;
  obsrValue: string;
}

// ---------------------------------------------------------------- 값 해석

/**
 * 강수량·적설은 숫자가 아니라 사람이 읽는 문자열로 온다.
 * 실제 응답에서 확인된 값: '강수없음', '0', '1.0mm', '2.0mm', '3.0mm', '1mm 미만', '적설없음'
 *
 * '미만'은 상한만 알려주므로 그 숫자를 그대로 쓰면 부풀려진다. 0으로 깎으면 '비가
 * 조금은 온다'는 정보가 사라지므로 절반으로 본다.
 */
function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;

  const matched = raw.match(/\d+(\.\d+)?/);
  if (!matched) return 0; // '강수없음', '적설없음'

  const value = Number(matched[0]);
  return raw.includes('미만') ? value / 2 : value;
}

function parseNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * 하늘상태(SKY)와 강수형태(PTY)를 아이콘·설명으로 옮긴다.
 *
 *   SKY: 맑음 1, 구름많음 3, 흐림 4
 *   PTY: 없음 0, 비 1, 비/눈 2, 눈 3, 소나기 4
 */
function describeWeather(sky: number, pty: number): { icon: string; desc: string } {
  // 비나 눈이 오면 하늘상태보다 강수형태가 우선이다
  switch (pty) {
    case 1:
      return { icon: '🌧', desc: '비' };
    case 2:
      return { icon: '🌨', desc: '비/눈' };
    case 3:
      return { icon: '❄️', desc: '눈' };
    case 4:
      return { icon: '🌦', desc: '소나기' };
  }

  switch (sky) {
    case 1:
      return { icon: '☀️', desc: '맑음' };
    case 3:
      return { icon: '⛅', desc: '구름 많음' };
    case 4:
      return { icon: '☁️', desc: '흐림' };
    default:
      return { icon: '⛅', desc: '구름 조금' };
  }
}

/**
 * 흩어진 줄들을 날짜+시각으로 묶는다.
 * Map은 삽입 순서를 유지하므로, 응답이 시간순인 이상 결과도 시간순이다.
 */
function groupByDateTime(items: FcstItem[]) {
  const grouped = new Map<string, Map<string, string>>();

  for (const item of items) {
    const key = `${item.fcstDate}${item.fcstTime}`;
    let slot = grouped.get(key);
    if (!slot) {
      slot = new Map();
      grouped.set(key, slot);
    }
    slot.set(item.category, item.fcstValue);
  }

  return grouped;
}

// ---------------------------------------------------------------- 공개 타입

/** 홈 상단의 현재 날씨. 관측값이라 예보와 섞이지 않게 따로 둔다. */
export interface CurrentWeather {
  /** 기온(°C) */
  temperature: number | null;
  /** 습도(%) */
  humidity: number | null;
  /** 1시간 강수량(mm) */
  rainfall: number;
  /** 풍속(m/s) */
  windSpeed: number | null;
  /** 풍향(deg). 바람이 불어오는 방향이다. */
  windDeg: number | null;
  /** 관측 시각 'HH:MM' */
  observedAt: string;
}

/** 시간대별 강수. */
export interface HourlyRain {
  hour: string;
  prob: number;
  amount: number;
  /** 그 시각의 하늘 상태 아이콘. */
  icon: string;
  desc: string;
}

/** 일별 예보. 주간 목록에서 중기예보와 합쳐 쓴다(weather-context의 buildWeekly). */
export interface DailyForecast {
  /** YYYYMMDD */
  date: string;
  day: string;
  short: string;
  icon: string;
  /** 일최고기온(TMX). 오늘은 오후 3시가 지나면 예보에서 빠져 null이 된다. */
  high: number | null;
  /** 일최저기온(TMN). 오늘은 새벽 6시가 지나면 예보에서 빠져 null이 된다. */
  low: number | null;
  /**
   * 응답에 실린 시간별 기온(TMP)의 최고·최저.
   *
   * TMX/TMN이 빠졌을 때 대신 쓸 수 있다. 다만 남아 있는 시간대만의 값이라 하루 전체의
   * 최고·최저와는 다르다. 저녁에 보면 새벽 추위가 빠져 최저가 실제보다 높게 나온다.
   */
  hourlyHigh: number | null;
  hourlyLow: number | null;
  rain: number;
  desc: string;
}

/** 단기예보 원본을 한 번만 받아 여러 화면이 나눠 쓴다. */
export interface Forecast {
  /**
   * 오늘 06~20시 중 응답에 남아 있는 것.
   *
   * 기상청은 지나간 시각을 빼므로 낮에 조회하면 앞부분이 없다. 그 빈칸은 예전에 받아
   * 기억해 둔 값으로 메운다(weather-context). 20시가 지나면 빈 배열이다.
   */
  hourlyToday: HourlyRain[];
  hourly: HourlyRain[];
  /**
   * hourly가 어느 날짜인지(YYYYMMDD).
   *
   * 오늘 06시가 지나면 오늘 칸이 부족해 다음 날을 고르므로, 화면이 '오늘'이라고
   * 단정하면 틀린다.
   */
  hourlyDate: string | null;
  daily: DailyForecast[];
  base: BaseTime;
}

// ---------------------------------------------------------------- 호출

export async function fetchCurrentWeather(grid: GridPoint, now: Date): Promise<CurrentWeather> {
  const base = ultraSrtNcstBase(now);
  const items = await fetchPublicData<NcstItem>(`${BASE_URL}/getUltraSrtNcst`, {
    numOfRows: ULTRA_SRT_NCST_ROWS,
    pageNo: 1,
    base_date: base.baseDate,
    base_time: base.baseTime,
    nx: grid.nx,
    ny: grid.ny,
  });

  const values = new Map(items.map((item) => [item.category, item.obsrValue]));

  return {
    temperature: parseNumber(values.get('T1H')),
    humidity: parseNumber(values.get('REH')),
    // 실황의 RN1은 숫자로 오지만, 형식이 흔들려도 견디게 같은 해석기를 쓴다
    rainfall: parseAmount(values.get('RN1')),
    windSpeed: parseNumber(values.get('WSD')),
    windDeg: parseNumber(values.get('VEC')),
    observedAt: `${base.baseTime.slice(0, 2)}:${base.baseTime.slice(2)}`,
  };
}

export async function fetchForecast(grid: GridPoint, now: Date): Promise<Forecast> {
  const base = vilageFcstBase(now);
  const items = await fetchPublicData<FcstItem>(`${BASE_URL}/getVilageFcst`, {
    numOfRows: VILAGE_FCST_ROWS,
    pageNo: 1,
    base_date: base.baseDate,
    base_time: base.baseTime,
    nx: grid.nx,
    ny: grid.ny,
  });

  const hourly = toHourlyRain(items);

  return {
    hourlyToday: hourlyForDate(items, ymd(now)),
    hourly: hourly.entries,
    hourlyDate: hourly.date,
    daily: toDailyForecast(items, now),
    base,
  };
}

// ---------------------------------------------------------------- 변환

const HOURLY_START = 6;
const HOURLY_END = 20;

/** 'YYYYMMDD' */
function ymd(date: Date) {
  const pad2 = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

interface HourlyRow extends HourlyRain {
  date: string;
  hourNumber: number;
}

/** 06~20시 구간의 줄만 날짜와 함께 모은다. */
function collectHourly(items: FcstItem[]): HourlyRow[] {
  const grouped = groupByDateTime(items);
  const rows: HourlyRow[] = [];

  for (const [key, values] of grouped) {
    const hourNumber = Number(key.slice(8, 10));
    if (hourNumber < HOURLY_START || hourNumber > HOURLY_END) continue;

    const { icon, desc } = describeWeather(
      parseNumber(values.get('SKY')) ?? 1,
      parseNumber(values.get('PTY')) ?? 0,
    );

    rows.push({
      date: key.slice(0, 8),
      hourNumber,
      hour: `${String(hourNumber).padStart(2, '0')}시`,
      prob: parseNumber(values.get('POP')) ?? 0,
      amount: parseAmount(values.get('PCP')),
      icon,
      desc,
    });
  }

  return rows;
}

const strip = ({ hour, prob, amount, icon, desc }: HourlyRow): HourlyRain => ({
  hour,
  prob,
  amount,
  icon,
  desc,
});

/** 특정 날짜의 06~20시 줄. 지나간 시각은 응답에 없으므로 앞이 비어 있을 수 있다. */
export function hourlyForDate(items: FcstItem[], date: string): HourlyRain[] {
  return collectHourly(items)
    .filter((row) => row.date === date)
    .sort((a, b) => a.hourNumber - b.hourNumber)
    .map(strip);
}

/**
 * 시간대별 강수 차트용. 화면이 06시~20시만 보여주므로 그 구간만 남긴다.
 *
 * 발표가 늦은 시각이면 오늘 06시 예보는 이미 지나가 응답에 없다. 그럴 때 앞을 비워 두면
 * 차트가 어긋나므로, 15칸이 온전히 남아 있는 날을 골라 쓴다.
 */
export function toHourlyRain(items: FcstItem[]): { date: string | null; entries: HourlyRain[] } {
  const rows = collectHourly(items);

  if (rows.length === 0) return { date: null, entries: [] };

  const expected = HOURLY_END - HOURLY_START + 1;
  const dates = [...new Set(rows.map((row) => row.date))];
  const target =
    dates.find((date) => rows.filter((row) => row.date === date).length === expected) ?? dates[0];

  return { date: target, entries: hourlyForDate(items, target) };
}

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYYMMDD' → Date. 문자열을 Date에 그대로 넣으면 시간대가 흔들려 직접 자른다. */
function parseYmd(ymd: string) {
  return new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8)));
}

function dayLabel(offset: number, date: Date) {
  if (offset === 0) return '오늘';
  if (offset === 1) return '내일';
  if (offset === 2) return '모레';
  return `${WEEKDAY_SHORT[date.getDay()]}요일`;
}

/**
 * 주간 목록용.
 *
 * 실제 응답은 5일치가 오지만 양 끝이 잘려 있다. 발표 시각 이후만 오므로 오늘은 지난
 * 시간이 없고, 마지막 날은 0시 한 칸만 실려 온다. 온전한 날과 부분적인 날이 섞여
 * 나오므로 high/low가 null인 항목이 있을 수 있고, 화면이 그 경우를 감당해야 한다.
 *
 * 주간 7일을 채우려면 4일차 이후를 중기예보 API로 보태야 한다.
 */
export function toDailyForecast(items: FcstItem[], now: Date): DailyForecast[] {
  const grouped = groupByDateTime(items);

  const byDate = new Map<
    string,
    {
      high: number | null;
      low: number | null;
      hourlyHigh: number | null;
      hourlyLow: number | null;
      rain: number;
      sky: number;
      pty: number;
    }
  >();

  for (const [key, values] of grouped) {
    const date = key.slice(0, 8);
    const hour = Number(key.slice(8, 10));

    let day = byDate.get(date);
    if (!day) {
      day = { high: null, low: null, hourlyHigh: null, hourlyLow: null, rain: 0, sky: 1, pty: 0 };
      byDate.set(date, day);
    }

    // TMX/TMN은 하루에 한 번만 실려 온다
    day.high = parseNumber(values.get('TMX')) ?? day.high;
    day.low = parseNumber(values.get('TMN')) ?? day.low;
    day.rain = Math.max(day.rain, parseNumber(values.get('POP')) ?? 0);

    // 시간별 기온은 매 시각 실려 오므로 대체값을 만들 수 있다
    const temp = parseNumber(values.get('TMP'));
    if (temp !== null) {
      day.hourlyHigh = day.hourlyHigh === null ? temp : Math.max(day.hourlyHigh, temp);
      day.hourlyLow = day.hourlyLow === null ? temp : Math.min(day.hourlyLow, temp);
    }

    // 아이콘은 낮의 대표 시각(정오~오후 3시)을 기준으로 삼는다
    if (hour >= 12 && hour <= 15) {
      day.sky = parseNumber(values.get('SKY')) ?? day.sky;
      day.pty = parseNumber(values.get('PTY')) ?? day.pty;
    }
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    /*
     * 단기예보 끝에는 하루가 안 되는 조각이 붙는다. 실제로 8월 24일 02시 발표는 28일치를
     * 한 시각만 실어 보냈다 — POP 하나뿐이고 TMX·TMN이 없다. 그걸 하루로 세면 주간 목록에서
     * 중기예보를 덮어 그 날 기온이 사라지고, 강수확률은 한 시각 표본이 하루를 대표해 버린다.
     *
     * 그래서 최고·최저기온이 둘 다 없는 '앞으로의 날짜'는 버린다. 오늘은 예외로 둔다 —
     * 늦은 시각에 받으면 최저기온이 이미 지나가 응답에 없다.
     */
    .filter(([date, day]) => {
      const offset = Math.round((parseYmd(date).getTime() - today) / dayMs);
      return offset <= 0 || day.high !== null || day.low !== null;
    })
    .map(([date, day]) => {
      const parsed = parseYmd(date);
      const offset = Math.round((parsed.getTime() - today) / dayMs);
      const { icon, desc } = describeWeather(day.sky, day.pty);

      return {
        date,
        day: dayLabel(offset, parsed),
        short: WEEKDAY_SHORT[parsed.getDay()],
        icon,
        high: day.high,
        low: day.low,
        hourlyHigh: day.hourlyHigh,
        hourlyLow: day.hourlyLow,
        rain: day.rain,
        desc,
      };
    });
}

// ---------------------------------------------------------------- 우산 알림

export interface UmbrellaAdvice {
  /** 비가 시작되는 시각 라벨 */
  from: string;
  /** 비가 끝나는 시각 라벨 */
  to: string;
  /** 강수확률이 가장 높은 시각 */
  peakHour: string;
  /** 그때의 강수확률(%) */
  peakProb: number;
}

/** 이 확률 이상을 '비가 온다'로 본다. 차트에서 파란색으로 강조하는 기준과 같다. */
export const RAIN_THRESHOLD = 60;

/**
 * 홈의 우산 알림 문구에 쓸 값. 기준을 넘는 구간이 없으면 null이라 카드를 숨기면 된다.
 *
 * 비가 오다 말다 할 수 있는데 문구는 '몇 시~몇 시' 하나만 담으므로, 처음 넘는 시각과
 * 마지막으로 넘는 시각을 양 끝으로 쓴다.
 */
export function umbrellaAdvice(hourly: HourlyRain[]): UmbrellaAdvice | null {
  const rainy = hourly.filter((entry) => entry.prob >= RAIN_THRESHOLD);
  if (rainy.length === 0) return null;

  const peak = rainy.reduce((best, entry) => (entry.prob > best.prob ? entry : best));

  return {
    from: rainy[0].hour,
    to: rainy[rainy.length - 1].hour,
    peakHour: peak.hour,
    peakProb: peak.prob,
  };
}
