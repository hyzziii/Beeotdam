/**
 * 에어코리아 대기오염정보를 앱이 쓰는 모양으로 옮긴다.
 *
 * 명세: https://www.data.go.kr/data/15073861/openapi.do
 *
 * 기상청·K-water와 또 다르다.
 *   - 응답 형식 지정이 dataType도 _type도 아니고 returnType이다
 *   - 지역이 아니라 측정소 단위다. 시/도로 조회하면 그 시/도의 모든 측정소가 배열로 온다
 *   - 값이 없을 때 '-' 문자열이나 빈 문자열로 온다
 */

import { AirStation } from '@/data';

import { ApiError, fetchPublicData } from './http';

const BASE_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

/**
 * 응답 한 줄. 한 측정소의 실시간 값이다.
 *
 * 등급 필드가 두 개씩 있는 게 함정이다.
 *   pm10Value   1시간 농도      pm10Grade1h  1시간 기준 등급
 *   pm10Value24 24시간 이동평균  pm10Grade    24시간 기준 등급
 *
 * 실제로 pm10Value 41에 pm10Grade가 '좋음'(1)으로 오는데, 그건 24시간 평균이 30이라
 * 그렇다. 1시간 농도 41은 1시간 기준으로 '보통'(2)이다. 기준이 다른 값을 짝지으면
 * 막대와 배지가 서로 어긋난다. 우리는 실시간 값을 보여주므로 1시간 기준으로 맞춘다.
 */
interface MesureItem {
  stationName: string;
  dataTime: string;
  pm10Value?: string;
  pm10Grade?: string;
  pm10Grade1h?: string;
  pm25Value?: string;
  pm25Grade?: string;
  pm25Grade1h?: string;
  o3Value?: string;
  /** 오존은 1시간 기준이 표준이라 등급이 하나뿐이다. */
  o3Grade?: string;
}

/**
 * 등급. 에어코리아가 1~4로 주고, 통합대기환경지수 기준이라 임의로 만든 구간이 아니다.
 */
export type AirGrade = '좋음' | '보통' | '나쁨' | '매우 나쁨';

const GRADES: Record<string, AirGrade> = {
  '1': '좋음',
  '2': '보통',
  '3': '나쁨',
  '4': '매우 나쁨',
};

export interface AirMetric {
  label: string;
  /** 화면에 쓸 값 문자열. 단위까지 포함한다. */
  reading: string;
  grade: AirGrade | null;
  /**
   * 게이지 채움 비율 0~1.
   *
   * '매우 나쁨'이 시작되는 값을 1로 잡았다. 환경부 예보 등급 구간을 그대로 쓴 것이라
   * 등급 배지와 같은 기준이다.
   */
  ratio: number;
}

export interface AirQuality {
  /** 값을 잰 측정소 이름. 지역 이름과 다를 수 있어 화면에 밝힌다. */
  stationName: string;
  /** 측정 시각. 'YYYY-MM-DD HH:mm' */
  dataTime: string;
  metrics: AirMetric[];
}

/**
 * 등급 구간의 '매우 나쁨' 시작값. 통합대기환경지수 1시간 기준 구간이라 배지와 같은 기준이다.
 *   미세먼지(PM10)   좋음 0~30, 보통 31~80, 나쁨 81~150, 매우나쁨 151~
 *   초미세먼지(PM2.5) 좋음 0~15, 보통 16~35, 나쁨 36~75, 매우나쁨 76~
 *   오존(ppm)        좋음 0~0.030, 보통 ~0.090, 나쁨 ~0.150, 매우나쁨 0.151~
 */
const VERY_BAD_FROM = { pm10: 151, pm25: 76, o3: 0.151 };

function toNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw === '' || raw === '-') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function ratioOf(value: number | null, veryBadFrom: number) {
  if (value === null) return 0;
  return Math.min(value / veryBadFrom, 1);
}

function metric(
  label: string,
  value: number | null,
  grade: string | undefined,
  { prefix = '', suffix = '' }: { prefix?: string; suffix?: string },
  veryBadFrom: number,
): AirMetric {
  return {
    label,
    reading: value === null ? '—' : `${prefix}${value}${suffix}`,
    grade: grade ? (GRADES[grade] ?? null) : null,
    ratio: ratioOf(value, veryBadFrom),
  };
}

/**
 * 한 지역의 대기질.
 *
 * 시/도 단위로 받아 우리 측정소만 골라낸다. 측정소별 조회 오퍼레이션도 있지만, 시/도로
 * 받으면 한 번에 끝나고 측정소 이름이 바뀌었을 때 목록에서 확인할 수 있다.
 */
export async function fetchAirQuality(station: AirStation): Promise<AirQuality> {
  const items = await fetchPublicData<MesureItem>(
    `${BASE_URL}/getCtprvnRltmMesureDnsty`,
    // ver 1.3부터 1시간 기준 등급(pm10Grade1h)이 함께 온다
    { numOfRows: 200, pageNo: 1, sidoName: station.sido, ver: '1.3' },
    'returnType',
  );

  const found = items.find((item) => item.stationName === station.station);
  if (!found) {
    /*
     * 측정소가 없어졌거나 이름이 바뀐 경우다. 생성기를 다시 돌려야 한다.
     * 화면이 오류 종류로 안내를 고르므로 ApiError로 던진다 — 맨 Error로 던지면
     * '서버 오류'로 뭉개져서 원인을 알 수 없다.
     */
    throw new ApiError('noData', `측정소 '${station.station}'을 찾지 못했습니다.`);
  }

  const pm10 = toNumber(found.pm10Value);
  const pm25 = toNumber(found.pm25Value);
  const o3 = toNumber(found.o3Value);

  return {
    stationName: found.stationName,
    dataTime: found.dataTime,
    metrics: [
      // 미세먼지가 PM10, 초미세먼지가 PM2.5다. Figma 시안은 둘이 뒤바뀌어 있었다.
      // 1시간 등급을 쓴다. 못 받으면 24시간 등급으로 물러선다.
      metric(
        '미세먼지',
        pm10,
        found.pm10Grade1h ?? found.pm10Grade,
        { prefix: 'PM10 ' },
        VERY_BAD_FROM.pm10,
      ),
      metric(
        '초미세먼지',
        pm25,
        found.pm25Grade1h ?? found.pm25Grade,
        { prefix: 'PM2.5 ' },
        VERY_BAD_FROM.pm25,
      ),
      metric('오존', o3, found.o3Grade, { suffix: ' ppm' }, VERY_BAD_FROM.o3),
    ],
  };
}
