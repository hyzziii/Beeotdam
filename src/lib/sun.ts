/**
 * 일출·일몰 시각을 위경도와 날짜로 계산한다.
 *
 * API로 받아오는 값이 아니라 계산값이다. 만들어낸 숫자가 아니라 천문 공식으로 나오는
 * 값이므로, 지역 좌표만 있으면 정확하게 구할 수 있다. 기상청 단기예보에는 일출·일몰이
 * 없어서 이 방법을 쓴다.
 *
 * NOAA(미국 해양대기청)가 공개한 일출 계산식을 옮긴 것이다. 대기 굴절과 태양 반지름을
 * 감안해 태양 중심이 지평선 아래 0.833°일 때를 일출로 본다.
 */

const DEG = Math.PI / 180;

/** 대기 굴절과 태양 반지름을 감안한 일출 고도각. */
const ZENITH = 90.833;

/** 한국 표준시. 화면에 쓸 시각이라 기기 시간대가 아니라 고정값이 맞다. */
const KST_OFFSET_HOURS = 9;

/** 그 해의 몇 번째 날인지. */
function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/**
 * 일출 또는 일몰의 한국 표준시 기준 시각(분). 계산이 되지 않으면 null.
 *
 * 백야·극야처럼 하루 종일 해가 뜨거나 지지 않는 곳에서는 값이 없다. 한국에서는 생기지
 * 않지만 공식 자체가 그런 경우를 만들 수 있어 확인한다.
 */
function solarEvent(lat: number, lng: number, date: Date, rising: boolean): number | null {
  const n = dayOfYear(date);

  // 경도를 시간으로 환산해 대략의 시각을 잡는다
  const lngHour = lng / 15;
  const t = n + ((rising ? 6 : 18) - lngHour) / 24;

  // 태양의 평균 근점 이각
  const meanAnomaly = 0.9856 * t - 3.289;

  // 태양의 진황경
  let trueLong =
    meanAnomaly +
    1.916 * Math.sin(meanAnomaly * DEG) +
    0.02 * Math.sin(2 * meanAnomaly * DEG) +
    282.634;
  trueLong = (trueLong + 360) % 360;

  // 적경. 사분면을 진황경과 맞춰야 한다
  let rightAsc = Math.atan(0.91764 * Math.tan(trueLong * DEG)) / DEG;
  rightAsc = (rightAsc + 360) % 360;
  rightAsc += Math.floor(trueLong / 90) * 90 - Math.floor(rightAsc / 90) * 90;
  rightAsc /= 15;

  // 적위
  const sinDec = 0.39782 * Math.sin(trueLong * DEG);
  const cosDec = Math.cos(Math.asin(sinDec));

  // 지방 시각
  const cosH =
    (Math.cos(ZENITH * DEG) - sinDec * Math.sin(lat * DEG)) / (cosDec * Math.cos(lat * DEG));

  // 해가 뜨지 않거나 지지 않는 날
  if (cosH > 1 || cosH < -1) return null;

  const h = (rising ? 360 - Math.acos(cosH) / DEG : Math.acos(cosH) / DEG) / 15;

  const mean = h + rightAsc - 0.06571 * t - 6.622;
  const utc = ((mean - lngHour) % 24 + 24) % 24;

  return Math.round((utc + KST_OFFSET_HOURS) * 60) % (24 * 60);
}

/** 'HH:MM' */
function formatMinutes(minutes: number) {
  const pad2 = (value: number) => String(value).padStart(2, '0');
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

export interface SunTimes {
  /** 'HH:MM'. 계산되지 않으면 null. */
  sunrise: string | null;
  sunset: string | null;
}

export function sunTimes(lat: number, lng: number, date: Date): SunTimes {
  const rise = solarEvent(lat, lng, date, true);
  const set = solarEvent(lat, lng, date, false);

  return {
    sunrise: rise === null ? null : formatMinutes(rise),
    sunset: set === null ? null : formatMinutes(set),
  };
}
