/**
 * 지역과 댐의 용수공급 관계.
 *
 * 이 파일의 규칙
 *   1. K-water 공식 자료로 이어지는 관계만 넣는다. 근거 없는 지역은 비워 둔다.
 *   2. 근거를 source에 남긴다. 나중에 맞는지 다시 확인할 수 있어야 한다.
 *   3. 자료가 시/군 단위면 시/군 단위로, 시/도 단위면 시/도 단위로 적는다.
 *      없는 정밀도를 만들지도, 있는 근거를 넓히지도 않는다.
 *
 * 하지 않는 것
 *   - 지역의 '저수율'을 만들지 않는다. 여러 댐이 걸린 지역이라도 평균내지 않는다.
 *     댐마다 자기 저수율을 따로 보여준다.
 *   - '이 지역 물은 이 댐에서만 온다'고 말하지 않는다. 지자체가 자체 취수하는 물도 있고,
 *     지자체가 관리하는 댐(광주 동복댐 등)은 K-water 자료에 아예 없다.
 *
 * 근거를 잇는 방식
 *   공급 지자체 목록(PDF)은 '지자체 → 담당 지사'까지만 알려주고 댐은 알려주지 않는다.
 *   그래서 지사·계통 이름이 댐 이름과 같거나, 유역본부 자료가 '댐 → 계통'을 밝힌 경우만
 *   이었다. 그렇지 않은 지사(울산권·창원권·포항권·구미권 등)는 비워 두었다.
 */

import { Region } from './regions'

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

/** 공급 지자체 목록. 여러 규칙이 이 자료에 기대고 있다. */
const SUPPLY_LIST = 'K-water 「광역상수도 공급 지자체 및 담당 지사 현황」(2023)'

const SOYANG = '소양강댐지사: "연간 12억㎡의 생·공용수를 서울 및 수도권지역에 공급"'
const CHUNGJU_WIDE =
    '충주댐지사: "서울, 인천, 성남, 하남 등 13개 지자체 및 일반고객에 생활, 공업, 하천유지용수 공급업무"'
const CHUNGJU_LOCAL = '충주댐지사 급수구역: "충주시,이천시,안성시,음성군,괴산군,진천군,증평군"'
const YONGDAM =
    '용담댐지사: "전주·익산·군산 등 전북지역 일원과 군장 산업기지 등 서해안 개발 사업지역에 ' +
    '연간 4억9천3백만톤의 맑고 깨끗한 물을 안정적으로 공급"'
const JUAM = '주암댐지사: "광주, 전남지역의 원활한 용수 공급"'

/**
 * 한 근거로 이어지는 관계 하나.
 *
 * sido를 주면 그 시/도 전체, districts를 주면 그 시/군만. 자료가 어느 단위로 적혀
 * 있는지에 맞춘다.
 */
interface Rule {
    damId: string
    damName: string
    relation: DamRelation
    source: string
    sido?: string
    /** '시도:시군구'. 구가 있는 시는 시 이름만 적으면 그 시의 모든 구에 걸린다. */
    districts?: string[]
}

const RULES: Rule[] = [
    // ── 한강유역 ────────────────────────────────────────────────────────────
    { damId: 'soyang', damName: '소양강댐', relation: '주요 수원', source: SOYANG, sido: '서울' },
    { damId: 'soyang', damName: '소양강댐', relation: '관련 수원', source: SOYANG, sido: '인천' },
    { damId: 'soyang', damName: '소양강댐', relation: '관련 수원', source: SOYANG, sido: '경기' },

    { damId: 'chungju', damName: '충주댐', relation: '주요 수원', source: CHUNGJU_WIDE, sido: '서울' },
    { damId: 'chungju', damName: '충주댐', relation: '주요 수원', source: CHUNGJU_WIDE, sido: '인천' },
    {
        damId: 'chungju',
        damName: '충주댐',
        relation: '주요 수원',
        source: CHUNGJU_WIDE,
        districts: ['경기:성남시', '경기:하남시'],
    },
    {
        damId: 'chungju',
        damName: '충주댐',
        relation: '주요 수원',
        source: CHUNGJU_LOCAL,
        districts: [
            '경기:이천시',
            '경기:안성시',
            '충북:충주시',
            '충북:음성군',
            '충북:괴산군',
            '충북:진천군',
            '충북:증평군',
        ],
    },
    {
        damId: 'hoengseong',
        damName: '횡성댐',
        relation: '주요 수원',
        source: `${SUPPLY_LIST}에서 횡성·원주는 횡성원주권지사 담당. 한강유역본부 계통 목록에 원주권광역 포함`,
        districts: ['강원:횡성군', '강원:원주시'],
    },

    // ── 금강유역 ────────────────────────────────────────────────────────────
    {
        damId: 'daecheong',
        damName: '대청댐',
        relation: '주요 수원',
        source: `금강유역본부: "(대청댐) 대청댐광역(Ⅰ~Ⅲ), 아산공업(Ⅰ~Ⅱ), 충남중부권광역" / ${SUPPLY_LIST}에서 부여·논산·공주는 충남중부권지사 담당`,
        districts: ['충남:부여군', '충남:논산시', '충남:공주시'],
    },
    {
        damId: 'yongdam',
        damName: '용담댐',
        relation: '주요 수원',
        source: YONGDAM,
        districts: ['전북:전주시', '전북:익산시', '전북:군산시'],
    },
    {
        damId: 'yongdam',
        damName: '용담댐',
        relation: '주요 수원',
        source: `금강유역본부: "(용담댐) 금강광역, 금산무주권광역, 전주권광역" / ${SUPPLY_LIST}에서 완주·김제는 전주권지사, 금산·진안은 금산권지사 담당`,
        districts: ['전북:완주군', '전북:김제시', '충남:금산군', '전북:진안군'],
    },
    { damId: 'yongdam', damName: '용담댐', relation: '관련 수원', source: YONGDAM, sido: '전북' },

    // ── 영산강·섬진강유역 ───────────────────────────────────────────────────
    {
        damId: 'juam',
        damName: '주암댐',
        relation: '주요 수원',
        source: `${JUAM} / 영·섬유역본부 계통 목록에 주암댐광역(Ⅰ,Ⅱ) 포함`,
        sido: '전남광주',
    },

    // ── 낙동강유역 ──────────────────────────────────────────────────────────
    {
        damId: 'unmun',
        damName: '운문댐',
        relation: '주요 수원',
        source: `${SUPPLY_LIST}에서 대구·경산·청도는 운문권지사 담당 (지사명이 곧 댐 이름)`,
        sido: '대구',
    },
    {
        damId: 'unmun',
        damName: '운문댐',
        relation: '주요 수원',
        source: `${SUPPLY_LIST}에서 대구·경산·청도는 운문권지사 담당 (지사명이 곧 댐 이름)`,
        districts: ['경북:경산시', '경북:청도군'],
    },
    {
        damId: 'unmun',
        damName: '운문댐',
        relation: '관련 수원',
        source: `${SUPPLY_LIST}에서 영천시는 포항권지사·운문권지사 공동 담당`,
        districts: ['경북:영천시'],
    },
    {
        damId: 'milyang',
        damName: '밀양댐',
        relation: '주요 수원',
        source: `${SUPPLY_LIST}에서 밀양은 밀양권지사 담당 (지사명이 곧 댐 이름). 낙동강유역본부 계통 목록에 밀양 포함`,
        districts: ['경남:밀양시'],
    },
    {
        damId: 'milyang',
        damName: '밀양댐',
        relation: '관련 수원',
        source: `${SUPPLY_LIST}에서 양산은 울산권지사·밀양권지사, 창녕은 밀양권지사·고령권지사 공동 담당`,
        districts: ['경남:양산시', '경남:창녕군'],
    },
]

/**
 * 연결된 댐이 없는 이유. 사정이 다른 지역만 적는다.
 *
 * 근거를 아직 확인하지 못한 것과, 원래 공급 대상이 아닌 것은 다르다.
 * 대전·부산은 공급 지자체 목록 113곳에 들어 있지 않다.
 */
const NO_DAM_REASON: Record<string, string> = {
    제주: '제주는 지하수를 주 수원으로 씁니다. K-water가 관리하는 댐이 없어요.',
    대전: '대전은 K-water 광역상수도 공급 지자체에 들어 있지 않아요. 자체 취수·정수 체계를 씁니다.',
    부산: '부산은 K-water 광역상수도 공급 지자체에 들어 있지 않아요. 낙동강 하류에서 직접 취수합니다.',
}

/** 시/도 단위 규칙과 시/군 단위 규칙을 미리 갈라 둔다. */
const BY_SIDO = new Map<string, RelatedDam[]>()
const BY_DISTRICT = new Map<string, RelatedDam[]>()

for (const rule of RULES) {
    const related: RelatedDam = {
        damId: rule.damId,
        damName: rule.damName,
        relation: rule.relation,
        source: rule.source,
    }

    if (rule.sido) {
        BY_SIDO.set(rule.sido, [...(BY_SIDO.get(rule.sido) ?? []), related])
    }

    for (const key of rule.districts ?? []) {
        BY_DISTRICT.set(key, [...(BY_DISTRICT.get(key) ?? []), related])
    }
}

/**
 * 지역에 연결된 댐. 근거가 없으면 빈 배열이다.
 *
 * 시/도 규칙과 시/군 규칙을 함께 쓴다. 서로 다른 자료가 각각 다른 댐을 가리키기
 * 때문이다 — 성남시는 '수도권'으로 소양강댐에, 공급 지자체 목록으로 충주댐에 걸린다.
 * 한쪽만 쓰면 나머지 댐을 잃는다.
 *
 * 같은 댐이 양쪽에 나오면 시/군 쪽을 남긴다. 지역을 콕 집어 말한 자료가 더 구체적이다.
 *
 * '성남시 분당구'처럼 구가 있는 시는 '경기:성남시' 규칙에도 걸린다. 공급 자료가 시
 * 단위로 적혀 있어 구까지 나누지 않기 때문이다.
 */
export function relatedDams(region: Region): RelatedDam[] {
    const cityOnly = region.district.split(' ')[0]

    const district = [
        ...(BY_DISTRICT.get(`${region.sido}:${region.district}`) ?? []),
        ...(BY_DISTRICT.get(`${region.sido}:${cityOnly}`) ?? []),
    ]
    const sido = BY_SIDO.get(region.sido) ?? []

    const merged = new Map<string, RelatedDam>()
    // 시/도 먼저 넣고 시/군으로 덮으면 더 구체적인 쪽이 남는다
    for (const item of [...sido, ...district]) merged.set(item.damId, item)

    return [...merged.values()]
}

/** 연결이 없을 때 화면에 쓸 문구. */
export function noRelationMessage(region: Region): string {
    return NO_DAM_REASON[region.sido] ?? '이 지역과 연결된 댐 정보를 아직 확인하지 못했어요.'
}

export function regionDams(region: Region): RegionDams {
    return {
        regionCode: region.code,
        regionName: `${region.sido} ${region.district}`,
        relatedDams: relatedDams(region),
    }
}
