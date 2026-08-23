/**
 * 한국수자원공사 수문 운영 정보를 앱이 쓰는 모양으로 옮긴다.
 *
 * 명세: https://www.data.go.kr/data/15099110/openapi.do
 *
 * 기상청과 달리 이쪽은 댐 하나씩 조회한다. 댐 목록을 한 번에 주는 오퍼레이션이 없어
 * 화면에 띄울 댐마다 호출해야 한다.
 *
 * 명세에는 시간/10분/일 세 종류가 있다고 적혀 있지만 일별 경로는 공개돼 있지 않고,
 * 짐작한 이름(daylist)은 '해당 오픈API 서비스가 없거나 폐기됨'을 돌려준다. 그래서
 * 시간별 하나로 7일치를 받아 날짜별 마지막 관측만 남겨 일별 자료를 만든다. 덕분에
 * 댐 하나당 호출도 한 번이면 된다.
 */

import { fetchPublicData } from './http';

const BASE_URL = 'https://apis.data.go.kr/B500001/dam/sluicePresentCondition';

/** 7일 × 24시간 + 여유. 한 번에 다 받아야 날짜별로 접을 수 있다. */
const ROWS = 300;

/** 주간 그래프에 쓸 일수. 오늘을 포함한다. */
const WEEK_DAYS = 7;

/**
 * 응답 한 줄. 필드 이름이 짧게 줄여져 있어 뜻을 주석으로 남긴다.
 *
 * 숫자가 문자열로 오기도 하고("94.640"), 천 단위 쉼표가 붙기도 한다("2,006.542").
 * 같은 필드가 줄마다 형식이 달라 그대로 쓰면 안 된다.
 */
interface SluiceItem {
  /** 관측 일시. 'MM-DD HH시' 형식이고 연도가 없다. */
  obsrdt: string;
  /** 댐 수위(EL.m) */
  lowlevel: number | string;
  /** 강우량(mm) */
  rf: number | string;
  /** 유입량(㎥/sec) */
  inflowqy: number | string;
  /** 총 방류량(㎥/sec) */
  totdcwtrqy: number | string;
  /** 저수량(백만㎥) */
  rsvwtqy: number | string;
  /** 저수율(%) */
  rsvwtrt: number | string;
}

/** 댐 한 곳의 한 시점 관측값. */
export interface DamReading {
  /** 'MM-DD' */
  day: string;
  /** 'MM-DD HH시' */
  observedAt: string;
  /** 저수율(%) */
  level: number;
  /** 수위(EL.m) */
  waterLevel: number;
  /** 강우량(mm) */
  rainfall: number;
  /** 유입량(㎥/s) */
  inflow: number;
  /** 방류량(㎥/s) */
  outflow: number;
  /** 저수량(백만㎥) */
  storage: number;
}

function toNumber(raw: number | string | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (!raw) return 0;
  // 천 단위 쉼표가 섞여 오므로 숫자와 소수점만 남긴다
  const value = Number(raw.replace(/[^\d.-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function toReading(item: SluiceItem): DamReading {
  const observedAt = String(item.obsrdt).trim();

  return {
    day: observedAt.slice(0, 5),
    observedAt,
    level: toNumber(item.rsvwtrt),
    waterLevel: toNumber(item.lowlevel),
    rainfall: toNumber(item.rf),
    inflow: toNumber(item.inflowqy),
    outflow: toNumber(item.totdcwtrqy),
    storage: toNumber(item.rsvwtqy),
  };
}

/** 'YYYY-MM-DD'. 이 API는 기상청과 달리 하이픈이 들어간 형식을 받는다. */
function formatDate(date: Date) {
  const pad2 = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function shiftDays(from: Date, days: number) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * 댐 카드에 필요한 값 한 묶음.
 *
 * 화면은 현재 저수율과 '전일 대비 증감'을 같이 보여주고, 카드를 펼치면 최근 7일
 * 그래프가 나온다. 한 번의 조회로 셋 다 만든다.
 */
export interface DamSnapshot {
  /** 가장 최근 관측. */
  current: DamReading;
  /** 전일 마지막 관측의 저수율. 자료가 없으면 null이라 증감을 숨기면 된다. */
  previousLevel: number | null;
  /** 날짜별 마지막 관측. 오래된 것부터. */
  daily: DamReading[];
}

export async function fetchDamSnapshot(damCode: string, now: Date): Promise<DamSnapshot> {
  const items = await fetchPublicData<SluiceItem>(
    `${BASE_URL}/hourlist`,
    {
      pageNo: 1,
      numOfRows: ROWS,
      damcode: damCode,
      stdt: formatDate(shiftDays(now, -(WEEK_DAYS - 1))),
      eddt: formatDate(now),
    },
    // K-water는 dataType이 아니라 _type을 본다
    '_type',
  );

  const readings = items.map(toReading);

  /*
   * 날짜별 마지막 관측만 남긴다. Map은 삽입 순서를 유지하고 응답이 시간순이므로,
   * 같은 날짜를 덮어쓰면 그 날의 마지막 값이 남는다.
   */
  const byDay = new Map<string, DamReading>();
  for (const reading of readings) byDay.set(reading.day, reading);

  const daily = [...byDay.values()];
  const current = readings[readings.length - 1];
  // 마지막 날은 오늘이므로 그 앞이 전일이다
  const previous = daily.length >= 2 ? daily[daily.length - 2] : undefined;

  return {
    current,
    previousLevel: previous ? previous.level : null,
    daily,
  };
}
