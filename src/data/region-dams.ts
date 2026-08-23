/**
 * 지역과 댐의 용수공급 관계.
 *
 * 이 파일의 규칙
 *   1. K-water가 공식적으로 밝힌 문구가 있는 관계만 넣는다. 근거 없는 지역은 비워 둔다.
 *   2. 근거 문구를 source에 그대로 인용한다. 나중에 맞는지 다시 확인할 수 있어야 한다.
 *   3. 문구가 시/도 단위면 시/도 단위로만 적는다. 없는 정밀도를 만들지 않는다.
 *
 * 하지 않는 것
 *   - 지역의 '저수율'을 만들지 않는다. 여러 댐이 걸린 지역이라도 평균내지 않는다.
 *     댐마다 자기 저수율을 따로 보여준다.
 *   - '이 지역 물은 이 댐에서만 온다'고 말하지 않는다. 실제 수원은 여러 곳이고
 *     지자체가 관리하는 댐(광주 동복댐 등)은 K-water 자료에 아예 없다.
 */

import { Region } from './regions'

/**
 * 공식 문구에 그 지역이 이름으로 나오면 '주요 수원', 상위 광역 단위로만 묶여 있으면
 * '관련 수원'으로 둔다. 용담댐처럼 '전주·익산·군산 등 전북지역'이라고 적힌 경우
 * 세 시는 주요, 나머지 전북은 관련이 된다.
 */
export type DamRelation = '주요 수원' | '관련 수원'

export interface RelatedDam {
    damId: string
    damName: string
    relation: DamRelation
    /** 근거 문구와 출처. */
    source: string
}

export interface RegionDams {
    regionCode: string
    regionName: string
    relatedDams: RelatedDam[]
}

const SOYANG_SOURCE =
    '소양강댐지사: "연간 12억㎡의 생·공용수를 서울 및 수도권지역에 공급" (kwater.or.kr)'
const YONGDAM_SOURCE =
    '용담댐지사: "전주·익산·군산 등 전북지역 일원과 군장 산업기지 등 서해안 개발 사업지역에 ' +
    '연간 4억9천3백만톤의 맑고 깨끗한 물을 안정적으로 공급" (kwater.or.kr)'
const JUAM_SOURCE = '주암댐지사: "광주, 전남지역의 원활한 용수 공급" (kwater.or.kr)'

/** 시/도 전체에 걸리는 관계. */
const BY_SIDO: Record<string, RelatedDam[]> = {
    서울: [{ damId: 'soyang', damName: '소양강댐', relation: '주요 수원', source: SOYANG_SOURCE }],
    인천: [{ damId: 'soyang', damName: '소양강댐', relation: '관련 수원', source: SOYANG_SOURCE }],
    경기: [{ damId: 'soyang', damName: '소양강댐', relation: '관련 수원', source: SOYANG_SOURCE }],
    전북: [{ damId: 'yongdam', damName: '용담댐', relation: '관련 수원', source: YONGDAM_SOURCE }],
    전남광주: [{ damId: 'juam', damName: '주암댐', relation: '주요 수원', source: JUAM_SOURCE }],
}

/**
 * 공식 문구가 시/군 이름을 직접 밝힌 곳. 시/도 항목보다 우선한다.
 * 키는 '시도:시군구'.
 */
const BY_DISTRICT: Record<string, RelatedDam[]> = {
    '전북:전주시 완산구': [
        { damId: 'yongdam', damName: '용담댐', relation: '주요 수원', source: YONGDAM_SOURCE },
    ],
    '전북:전주시 덕진구': [
        { damId: 'yongdam', damName: '용담댐', relation: '주요 수원', source: YONGDAM_SOURCE },
    ],
    '전북:익산시': [
        { damId: 'yongdam', damName: '용담댐', relation: '주요 수원', source: YONGDAM_SOURCE },
    ],
    '전북:군산시': [
        { damId: 'yongdam', damName: '용담댐', relation: '주요 수원', source: YONGDAM_SOURCE },
    ],
}

/**
 * 지역에 연결된 댐. 근거가 없으면 빈 배열이다.
 *
 * 빈 배열은 오류가 아니다. 제주는 지하수를 쓰고, 자료를 아직 확인하지 못한 지역도 있다.
 * 화면은 '연결된 댐 정보가 없어요'로 두면 된다.
 */
export function relatedDams(region: Region): RelatedDam[] {
    return BY_DISTRICT[`${region.sido}:${region.district}`] ?? BY_SIDO[region.sido] ?? []
}

/**
 * 연결된 댐이 없는 이유. 사정이 다른 지역만 적는다.
 *
 * 근거를 아직 확인하지 못한 것과, 원래 댐이 없는 것은 다르다. 제주는 후자다 —
 * K-water가 관리하는 57개 시설 중 제주에 있는 것이 없다.
 */
const NO_DAM_REASON: Record<string, string> = {
    제주: '제주는 지하수를 주 수원으로 씁니다. K-water가 관리하는 댐이 없어요.',
}

/** 연결이 없을 때 화면에 쓸 문구. */
export function noRelationMessage(region: Region): string {
    return (
        NO_DAM_REASON[region.sido] ??
        '이 지역과 연결된 댐 정보를 아직 확인하지 못했어요.'
    )
}

export function regionDams(region: Region): RegionDams {
    return {
        regionCode: region.code,
        regionName: `${region.sido} ${region.district}`,
        relatedDams: relatedDams(region),
    }
}
