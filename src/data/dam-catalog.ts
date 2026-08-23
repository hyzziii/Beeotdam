/**
 * K-water가 관리하는 댐의 정적 정보.
 *
 * 여기 있는 damCode는 모두 '수문 제원 현황' API에 코드를 넣어 돌아온 댐 이름으로
 * 하나씩 확인한 값이다. 코드를 추측해서 넣으면 안 된다. 틀린 코드도 정상 응답하면서
 * 엉뚱한 댐의 저수율을 주기 때문에 화면에는 아무 이상이 없어 보인다.
 *
 * 저수율·유입량 같은 값은 여기 두지 않는다. 그건 매번 API에서 받아야 하는 값이다.
 */

/**
 * 댐 종류.
 *
 * 다목적댐은 용수공급과 홍수조절, 발전을 겸한다. 용수댐은 물 공급 전용이라 홍수조절
 * 기능이 없다. 도시 식수를 대는 댐이 용수댐인 경우가 많다(대구의 운문댐).
 */
export type DamKind = 'multipurpose' | 'watersupply'

/**
 * 댐마다 정해진 수위 기준(EL.m). 제원 API에서 받아 적어 둔 값이다.
 *
 * 실행 중에 제원 API를 부르지 않는다. 바뀌지 않는 값인데 그 API는 하루 100회만
 * 허용되므로, 한 번 받아 여기 넣어 두는 게 맞다.
 *
 * 현재 수위가 이 기준을 넘었는지는 운영 API의 수위와 비교해 판단한다(lib/dam.ts).
 * 저수율 막대에 눈금으로 표시할 수는 없다 — 저수율은 유효저수용량 대비 비율이라
 * 상시만수위가 곧 100%이고, 수위를 저수율로 바꾸려면 수위-용량 곡선이 필요하다.
 */
export interface DamLevels {
    /** 저수위. 이 아래로는 쓸 수 없는 물이다. */
    low: number
    /** 홍수기 제한수위. 홍수기에는 이 아래로 유지한다. */
    floodLimit: number
    /** 상시만수위. 평상시 채워 두는 최고 수위. */
    normalHigh: number
    /** 계획홍수위. 댐 설계상 견디는 최고 수위. */
    designFlood: number
}

export interface CatalogDam {
    /** 앱 안에서 쓰는 식별자. */
    id: string
    /** K-water 수문 정보 조회용 7자리 코드. */
    damCode: string
    /** 화면에 쓰는 이름. */
    name: string
    /** 제원 API가 돌려준 하천명. */
    river: string
    kind: DamKind
    levels: DamLevels
}

export const damCatalog: CatalogDam[] = [
    // 한강 수계
    { id: 'soyang',    damCode: '1012110', name: '소양강댐', river: '소양강',   kind: 'multipurpose',
      levels: { low: 150, floodLimit: 190.3, normalHigh: 193.5, designFlood: 198 } },
    { id: 'chungju',   damCode: '1003110', name: '충주댐',   river: '남한강',   kind: 'multipurpose',
      levels: { low: 110, floodLimit: 138, normalHigh: 141, designFlood: 145 } },
    { id: 'hoengseong',damCode: '1006110', name: '횡성댐',   river: '계천',     kind: 'multipurpose',
      levels: { low: 160, floodLimit: 178.2, normalHigh: 180, designFlood: 180 } },
    { id: 'gwangdong', damCode: '1001210', name: '광동댐',   river: '골지천',   kind: 'watersupply',
      levels: { low: 662, floodLimit: 672, normalHigh: 672, designFlood: 675.3 } },

    // 낙동강 수계
    { id: 'andong',    damCode: '2001110', name: '안동댐',   river: '낙동강',   kind: 'multipurpose',
      levels: { low: 130, floodLimit: 160, normalHigh: 160, designFlood: 161.7 } },
    { id: 'imha',      damCode: '2002110', name: '임하댐',   river: '반변천',   kind: 'multipurpose',
      levels: { low: 137, floodLimit: 161.7, normalHigh: 163, designFlood: 164.7 } },
    { id: 'hapcheon',  damCode: '2015110', name: '합천댐',   river: '황강',     kind: 'multipurpose',
      levels: { low: 140, floodLimit: 176, normalHigh: 176, designFlood: 179 } },
    { id: 'namgang',   damCode: '2018110', name: '남강댐',   river: '남강',     kind: 'multipurpose',
      levels: { low: 32, floodLimit: 41, normalHigh: 41, designFlood: 46 } },
    { id: 'milyang',   damCode: '2021110', name: '밀양댐',   river: '단장천',   kind: 'multipurpose',
      levels: { low: 150, floodLimit: 207.2, normalHigh: 207.2, designFlood: 210.2 } },
    { id: 'unmun',     damCode: '2021210', name: '운문댐',   river: '동창천',   kind: 'watersupply',
      levels: { low: 122, floodLimit: 150, normalHigh: 150, designFlood: 152.6 } },
    { id: 'yeongcheon',damCode: '2012210', name: '영천댐',   river: '자호천',   kind: 'watersupply',
      levels: { low: 138, floodLimit: 156.8, normalHigh: 156.8, designFlood: 159.3 } },

    // 금강 수계
    { id: 'daecheong', damCode: '3008110', name: '대청댐',   river: '금강',     kind: 'multipurpose',
      levels: { low: 60, floodLimit: 76.5, normalHigh: 76.5, designFlood: 80 } },
    { id: 'yongdam',   damCode: '3001110', name: '용담댐',   river: '금강',     kind: 'multipurpose',
      levels: { low: 228.5, floodLimit: 261.5, normalHigh: 263.5, designFlood: 265.5 } },

    // 섬진강 수계
    { id: 'seomjin',   damCode: '4001110', name: '섬진강댐', river: '섬진강',   kind: 'multipurpose',
      levels: { low: 154.54, floodLimit: 194, normalHigh: 196.5, designFlood: 197.7 } },
    { id: 'juam',      damCode: '4007110', name: '주암댐',   river: '보성강',   kind: 'multipurpose',
      levels: { low: 85, floodLimit: 108.5, normalHigh: 108.5, designFlood: 110.5 } },
]

export function findCatalogDam(id: string) {
    return damCatalog.find((dam) => dam.id === id)
}
