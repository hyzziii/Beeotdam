/**
 * 위경도를 기상청 격자 좌표(nx, ny)로 바꾼다.
 *
 * 기상청 단기예보 API는 위경도를 받지 않고 자체 격자 번호를 요구한다. 격자는 전국을
 * 5km 간격으로 자른 것이고, 변환식은 람베르트 정각원뿔도법이다. 아래 상수는 기상청이
 * 배포하는 변환 예제의 값을 그대로 옮긴 것이라 임의로 바꾸면 안 된다.
 *
 * 참고: https://datawiki.kma.go.kr/doku.php?id=기상예보:날씨예보:단기예보
 */

const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 표준 위도 1(도)
const SLAT2 = 60.0; // 표준 위도 2(도)
const OLON = 126.0; // 기준점 경도(도)
const OLAT = 38.0; // 기준점 위도(도)
const XO = 43; // 기준점의 격자 X 좌표
const YO = 136; // 기준점의 격자 Y 좌표

const DEGRAD = Math.PI / 180.0;

/**
 * 좌표와 무관한 투영 상수들. 매 호출마다 다시 계산할 필요가 없어 모듈 로드 때 한 번만 구한다.
 */
const projection = (() => {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  return { re, olon, sn, sf, ro };
})();

export interface GridPoint {
  nx: number;
  ny: number;
}

/** 위경도 → 격자 좌표. 격자는 정수라 마지막에 반올림한다. */
export function toGrid(lat: number, lng: number): GridPoint {
  const { olon, sn, sf, re, ro } = projection;

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lng * DEGRAD - olon;
  // 날짜변경선을 넘어가는 경도를 -180~180 범위로 되돌린다
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}
