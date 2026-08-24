/**
 * 시/도별 중기예보 구역코드.
 *
 * 중기예보는 격자(nx·ny)가 아니라 구역코드로 조회하고, 육상예보와 기온이 코드 체계도
 * API도 다르다.
 *   육상(getMidLandFcst) — 날씨·강수확률. 전국 10개 권역
 *   기온(getMidTa)       — 최고·최저기온. 도시 단위
 *
 * 기온은 도시 단위라 254개 시군구를 다 매핑할 수 없다. 그래서 시/도마다 대표 도시
 * 하나를 둔다. 중기예보는 원래 오전·오후로 뭉뚱그린 4~10일 예보라 구 단위 정밀도가
 * 의미 없고, 실제 예보 오차가 도시 간 차이보다 크다.
 *
 * 코드 확인 방법
 *   1. 기온 코드 앞 4자리가 그 지역 육상 구역코드와 일치한다.
 *      서울 11B10101 ↔ 육상 11B00000, 춘천 11D10301 ↔ 11D10000 등 16개 모두 맞다.
 *   2. 같은 도시의 단기예보 3일 후 기온과 중기 4일 후 기온을 비교했다.
 *      16개 전부 차이 3°C 이내로 이어졌다. 엉뚱한 지역 코드면 값이 벌어진다.
 */

export interface MidRegion {
    /** getMidLandFcst용. 날씨·강수확률. */
    land: string
    /** getMidTa용. 기온. */
    ta: string
    /** 기온 코드가 가리키는 대표 도시. 화면에 밝힐 때 쓴다. */
    taCity: string
}

const MID_REGIONS: Record<string, MidRegion> = {
    서울: { land: '11B00000', ta: '11B10101', taCity: '서울' },
    인천: { land: '11B00000', ta: '11B20201', taCity: '인천' },
    경기: { land: '11B00000', ta: '11B20601', taCity: '수원' },
    // 강원은 영서·영동으로 갈리지만 대표는 영서(춘천)로 둔다
    강원: { land: '11D10000', ta: '11D10301', taCity: '춘천' },
    충북: { land: '11C10000', ta: '11C10301', taCity: '청주' },
    충남: { land: '11C20000', ta: '11C20101', taCity: '홍성' },
    대전: { land: '11C20000', ta: '11C20401', taCity: '대전' },
    세종: { land: '11C20000', ta: '11C20404', taCity: '세종' },
    전북: { land: '11F10000', ta: '11F10201', taCity: '전주' },
    전남광주: { land: '11F20000', ta: '11F20501', taCity: '광주' },
    대구: { land: '11H10000', ta: '11H10701', taCity: '대구' },
    경북: { land: '11H10000', ta: '11H10501', taCity: '안동' },
    부산: { land: '11H20000', ta: '11H20201', taCity: '부산' },
    울산: { land: '11H20000', ta: '11H20101', taCity: '울산' },
    경남: { land: '11H20000', ta: '11H20301', taCity: '창원' },
    제주: { land: '11G00000', ta: '11G00201', taCity: '제주' },
}

export function findMidRegion(sido: string): MidRegion | undefined {
    return MID_REGIONS[sido]
}
