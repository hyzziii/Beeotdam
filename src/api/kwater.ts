/**
 * 한국수자원공사 수문 운영 정보를 앱이 쓰는 모양으로 옮긴다.
 *
 * 명세: https://www.data.go.kr/data/15099110/openapi.do
 *
 * 기상청과 달리 이쪽은 댐 하나씩 조회한다. 댐 목록을 한 번에 주는 오퍼레이션이 없어
 * 화면에 띄울 댐마다 호출해야 한다.
 */

import { fetchPublicData } from './http';

const BASE_URL = 'https://apis.data.go.kr/B500001/dam/sluicePresentCondition';

/**
 * 응답 한 줄. 필드 이름이 짧게 줄여져 있어 뜻을 주석으로 남긴다.
 * 숫자도 문자열로 오므로 그대로 쓰면 안 된다.
 */
interface SluiceItem {
  /** 관측 일시 */
  obsrdt: string;
  /** 댐 수위(EL.m) */
  lowlevel: string;
  /** 강우량(mm) */
  rf: string;
  /** 유입량(㎥/sec) */
  inflowqy: string;
  /** 총 방류량(㎥/sec) */
  totdcwtrqy: string;
  /** 저수량(백만㎥) */
  rsvwtqy: string;
  /** 저수율(%) */
  rsvwtrt: string;
}

/** 댐 한 곳의 한 시점 관측값. */
export interface DamReading {
  /** 관측 일시 원본 문자열 */
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

function toNumber(raw: string | undefined): number {
  if (!raw) return 0;
  // 천 단위 쉼표가 섞여 오는 경우가 있어 숫자와 소수점만 남긴다
  const value = Number(raw.replace(/[^\d.-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function toReading(item: SluiceItem): DamReading {
  return {
    observedAt: item.obsrdt,
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

/** 조회 주기. 화면이 쓰는 것만 노출한다. */
type Period = 'hourlist' | 'daylist';

async function fetchReadings(
  damCode: string,
  period: Period,
  from: Date,
  to: Date,
  rows: number,
): Promise<DamReading[]> {
  const items = await fetchPublicData<SluiceItem>(
    `${BASE_URL}/${period}`,
    {
      pageNo: 1,
      numOfRows: rows,
      damcode: damCode,
      stdt: formatDate(from),
      eddt: formatDate(to),
    },
    // K-water는 dataType이 아니라 _type을 본다
    '_type',
  );

  return items.map(toReading);
}

/**
 * 댐 카드에 필요한 값 한 묶음.
 *
 * 화면은 현재 저수율과 '전일 대비 증감'을 같이 보여준다. 증감을 내려면 어제 값도
 * 필요하므로 일별 자료를 이틀치 받아 함께 돌려준다.
 */
export interface DamSnapshot {
  /** 가장 최근 시간별 관측 */
  current: DamReading;
  /** 전일 저수율. 자료가 없으면 null이라 증감을 숨기면 된다. */
  previousLevel: number | null;
  /** 최근 7일 일별 관측. 카드를 펼쳤을 때의 그래프에 쓴다. */
  weekly: DamReading[];
}

export async function fetchDamSnapshot(damCode: string, now: Date): Promise<DamSnapshot> {
  const weekAgo = shiftDays(now, -6);

  // 시간별과 일별을 같이 받는다. 서로 기다릴 필요가 없어 동시에 던진다.
  const [hourly, daily] = await Promise.all([
    // 오늘 자료만 받아 마지막 줄을 쓴다. 24시간을 넉넉히 덮는다.
    fetchReadings(damCode, 'hourlist', now, now, 24),
    fetchReadings(damCode, 'daylist', weekAgo, now, 7),
  ]);

  const current = hourly[hourly.length - 1];
  // 일별 마지막이 오늘이므로 전일은 그 앞이다
  const previous = daily.length >= 2 ? daily[daily.length - 2] : undefined;

  return {
    current,
    previousLevel: previous ? previous.level : null,
    weekly: daily,
  };
}

/*
 * TODO(2-d): 댐 코드를 아직 모른다.
 *
 * damcode는 7자리 숫자인데 명세 예시에 2022510 하나만 나와 있어 나머지를 유추할 수
 * 없다. 소양강댐·충주댐 등의 실제 코드는 '한국수자원공사_수문 제원 현황'
 * (https://www.data.go.kr/data/15099107/openapi.do)을 한 번 호출해 받아와야 한다.
 * 확인한 코드는 src/data/dams.ts의 각 댐에 damCode로 넣는다. 추측한 값을 넣으면
 * 엉뚱한 댐의 저수율이 조용히 표시되므로 확인 전에는 비워 둔다.
 */
