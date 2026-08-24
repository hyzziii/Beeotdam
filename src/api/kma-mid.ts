/**
 * 기상청 중기예보를 앱이 쓰는 모양으로 옮긴다.
 *
 * 명세: https://www.data.go.kr/data/15059468/openapi.do
 *
 * 단기예보와 여러 가지가 다르다.
 *   - 격자(nx·ny)가 아니라 구역코드(regId)로 조회한다
 *   - 날씨·강수확률(getMidLandFcst)과 기온(getMidTa)이 API가 갈려 있다
 *   - 한 줄에 4~10일치가 전부 들어 있다. 필드 이름에 날짜 번호가 박혀 있어
 *     wf4Am, rnSt4Am, taMax4 처럼 번호를 붙여 읽어야 한다
 *   - 8~10일은 오전·오후 구분이 없다
 */

import { MidRegion } from '@/data';

import { fetchPublicData } from './http';

const BASE_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService';

/** 중기예보가 다루는 날짜 범위(발표일 기준 며칠 후). */
const FIRST_DAY = 4;
const LAST_DAY = 7;

/** 육상예보 한 줄. 날짜 번호가 붙은 필드를 색인으로 읽으려 느슨하게 둔다. */
type LandItem = Record<string, string | number | undefined>;
type TaItem = Record<string, string | number | undefined>;

export interface MidForecastDay {
  /** YYYYMMDD */
  date: string;
  /** 발표일 기준 며칠 후인지. */
  dayAfter: number;
  icon: string;
  desc: string;
  /** 강수확률(%). 오전·오후가 갈리면 높은 쪽. */
  rain: number;
  high: number | null;
  low: number | null;
}

const pad2 = (value: number) => String(value).padStart(2, '0');

function ymd(date: Date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

/**
 * 발표 시각(tmFc). 중기예보는 하루 두 번, 06시와 18시에 나온다.
 *
 * 단기예보처럼 발표 직후에는 아직 안 올라와 있을 수 있어 여유를 둔다.
 */
export function midBaseTime(now: Date): string {
  const cutoff = new Date(now.getTime() - 15 * 60 * 1000);
  const hour = cutoff.getHours();

  if (hour >= 18) return `${ymd(cutoff)}1800`;
  if (hour >= 6) return `${ymd(cutoff)}0600`;

  const yesterday = new Date(cutoff);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${ymd(yesterday)}1800`;
}

/** 'YYYYMMDDHHMM' 앞 8자리를 Date로. */
function baseDateOf(tmFc: string) {
  return new Date(Number(tmFc.slice(0, 4)), Number(tmFc.slice(4, 6)) - 1, Number(tmFc.slice(6, 8)));
}

function toNumber(raw: string | number | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * 중기 날씨 문구를 아이콘으로. 실제 응답에서 확인된 값은 '구름많음' 정도지만,
 * 명세상 '흐리고 비', '구름많고 눈' 같은 조합이 온다.
 */
function iconFor(desc: string): string {
  if (desc.includes('눈')) return desc.includes('비') ? '🌨' : '❄️';
  if (desc.includes('소나기')) return '🌦';
  if (desc.includes('비')) return '🌧';
  if (desc.includes('흐림') || desc.includes('흐리고')) return '☁️';
  if (desc.includes('구름많음') || desc.includes('구름많고')) return '⛅';
  if (desc.includes('맑음')) return '☀️';
  return '⛅';
}

/**
 * 8일 이후는 오전·오후가 나뉘지 않아 필드 이름이 다르다.
 * 4~7일: wf4Am / wf4Pm,  8~10일: wf8
 */
function readDay(land: LandItem, ta: TaItem, day: number) {
  const split = day <= 7;

  const descAm = String(land[split ? `wf${day}Am` : `wf${day}`] ?? '');
  const descPm = String(land[split ? `wf${day}Pm` : `wf${day}`] ?? descAm);

  const rainAm = toNumber(land[split ? `rnSt${day}Am` : `rnSt${day}`]) ?? 0;
  const rainPm = toNumber(land[split ? `rnSt${day}Pm` : `rnSt${day}`]) ?? rainAm;

  // 하루를 한 줄로 보여주므로 비 올 가능성이 큰 쪽을 대표로 쓴다
  const rainier = rainPm > rainAm ? descPm : descAm;

  return {
    desc: rainier,
    icon: iconFor(rainier),
    rain: Math.max(rainAm, rainPm),
    high: toNumber(ta[`taMax${day}`]),
    low: toNumber(ta[`taMin${day}`]),
  };
}

/**
 * 4~7일 후 예보. 육상과 기온을 각각 받아 날짜별로 합친다.
 *
 * 둘 중 하나만 실패하면 그 값만 비운다 — 기온을 못 받아도 날씨는 보여줄 수 있다.
 */
export async function fetchMidForecast(
  region: MidRegion,
  now: Date,
): Promise<MidForecastDay[]> {
  const tmFc = midBaseTime(now);

  const params = { pageNo: 1, numOfRows: 10, tmFc };

  const [land, ta] = await Promise.all([
    fetchPublicData<LandItem>(`${BASE_URL}/getMidLandFcst`, { ...params, regId: region.land }),
    fetchPublicData<TaItem>(`${BASE_URL}/getMidTa`, { ...params, regId: region.ta }),
  ]);

  const landItem = land[0] ?? {};
  const taItem = ta[0] ?? {};
  const baseDate = baseDateOf(tmFc);

  const days: MidForecastDay[] = [];
  for (let day = FIRST_DAY; day <= LAST_DAY; day++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + day);

    days.push({ date: ymd(date), dayAfter: day, ...readDay(landItem, taItem, day) });
  }

  return days;
}
