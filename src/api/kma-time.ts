/**
 * 기상청 API에 넘길 발표일자(base_date)와 발표시각(base_time)을 구한다.
 *
 * 기상청은 예보를 아무 때나 주지 않는다. 정해진 시각에 발표하고, 그 시각을 인자로
 * 넘겨야 한다. 게다가 발표 시각이 되자마자 조회되는 것도 아니라 몇 분을 더 기다려야
 * 하는데, 그 사이에 요청하면 값이 아니라 NO_DATA가 돌아온다. 그래서 "지금 조회 가능한
 * 가장 최근 발표"를 골라주는 계산이 필요하다.
 *
 * 모든 함수가 기준 시각을 인자로 받는다. Date.now()를 안에서 부르면 검증할 수 없다.
 */

export interface BaseTime {
  /** YYYYMMDD */
  baseDate: string;
  /** HHMM */
  baseTime: string;
}

/** 단기예보 발표 시각(시). 하루 8번. */
const VILAGE_FCST_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

/** 발표 시각이 지나고 실제로 조회되기까지의 여유(분). */
const VILAGE_FCST_DELAY_MINUTES = 15;
const ULTRA_SRT_NCST_DELAY_MINUTES = 45;

const pad2 = (value: number) => String(value).padStart(2, '0');

function formatDate(date: Date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

/** 같은 날의 다른 시각, 또는 며칠 전으로 옮긴 Date를 만든다. */
function shift(from: Date, days: number, hour: number) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/**
 * 단기예보(getVilageFcst)용. 02·05·08·11·14·17·20·23시 발표 중 지금 조회 가능한 최신 것.
 *
 * 예: 14:10이면 14시 발표는 아직 안 올라왔을 수 있어 11시 발표를 쓴다.
 *     01:00이면 그날 발표가 하나도 없어 전날 23시 발표로 넘어간다.
 */
export function vilageFcstBase(now: Date): BaseTime {
  const cutoff = new Date(now.getTime() - VILAGE_FCST_DELAY_MINUTES * 60 * 1000);

  // 늦은 발표부터 훑어 cutoff를 넘지 않는 첫 번째를 고른다
  for (const hour of [...VILAGE_FCST_HOURS].reverse()) {
    const announced = shift(cutoff, 0, hour);
    if (announced.getTime() <= cutoff.getTime()) {
      return { baseDate: formatDate(announced), baseTime: `${pad2(hour)}00` };
    }
  }

  // 자정~02:15 사이. 전날 마지막 발표(23시)로 돌아간다.
  const yesterday = shift(cutoff, -1, 23);
  return { baseDate: formatDate(yesterday), baseTime: '2300' };
}

/**
 * 초단기실황(getUltraSrtNcst)용. 매시 정시 관측이고 40분쯤부터 조회된다.
 *
 * 예: 14:20이면 14시 관측이 아직 없어 13시 관측을 쓴다.
 */
export function ultraSrtNcstBase(now: Date): BaseTime {
  const cutoff = new Date(now.getTime() - ULTRA_SRT_NCST_DELAY_MINUTES * 60 * 1000);

  return {
    baseDate: formatDate(cutoff),
    baseTime: `${pad2(cutoff.getHours())}00`,
  };
}
