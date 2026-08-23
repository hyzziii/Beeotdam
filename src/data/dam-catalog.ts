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
}

export const damCatalog: CatalogDam[] = [
    // 한강 수계
    { id: 'soyang',    damCode: '1012110', name: '소양강댐', river: '소양강',   kind: 'multipurpose' },
    { id: 'chungju',   damCode: '1003110', name: '충주댐',   river: '남한강',   kind: 'multipurpose' },
    { id: 'hoengseong',damCode: '1006110', name: '횡성댐',   river: '계천',     kind: 'multipurpose' },
    { id: 'gwangdong', damCode: '1001210', name: '광동댐',   river: '골지천',   kind: 'watersupply' },

    // 낙동강 수계
    { id: 'andong',    damCode: '2001110', name: '안동댐',   river: '낙동강',   kind: 'multipurpose' },
    { id: 'imha',      damCode: '2002110', name: '임하댐',   river: '반변천',   kind: 'multipurpose' },
    { id: 'hapcheon',  damCode: '2015110', name: '합천댐',   river: '황강',     kind: 'multipurpose' },
    { id: 'namgang',   damCode: '2018110', name: '남강댐',   river: '남강',     kind: 'multipurpose' },
    { id: 'milyang',   damCode: '2021110', name: '밀양댐',   river: '단장천',   kind: 'multipurpose' },
    { id: 'unmun',     damCode: '2021210', name: '운문댐',   river: '동창천',   kind: 'watersupply' },
    { id: 'yeongcheon',damCode: '2012210', name: '영천댐',   river: '자호천',   kind: 'watersupply' },

    // 금강 수계
    { id: 'daecheong', damCode: '3008110', name: '대청댐',   river: '금강',     kind: 'multipurpose' },
    { id: 'yongdam',   damCode: '3001110', name: '용담댐',   river: '금강',     kind: 'multipurpose' },

    // 섬진강 수계
    { id: 'seomjin',   damCode: '4001110', name: '섬진강댐', river: '섬진강',   kind: 'multipurpose' },
    { id: 'juam',      damCode: '4007110', name: '주암댐',   river: '보성강',   kind: 'multipurpose' },
]

export function findCatalogDam(id: string) {
    return damCatalog.find((dam) => dam.id === id)
}
