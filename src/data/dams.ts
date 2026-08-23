export type DamStatus = 'surplus' | 'good' | 'normal' | 'caution' | 'warning'

export interface Dam {
    id: string
    /**
     * K-water 수문 운영 정보 조회에 쓰는 댐 코드.
     *
     * 코드를 넣고 '수문 제원 현황'이 돌려주는 댐 이름으로 하나씩 확인한 값이다.
     * 추측한 코드도 정상 응답하면서 엉뚱한 댐 자료를 주므로 확인 없이 넣으면 안 된다.
     */
    damCode: string
    name: string
    region: string
    river: string
    level: number
    prevLevel: number
    capacity: number
    lat: number
    lng: number
    status: DamStatus
    inflow: number
    outflow: number
    weeklyData: { day: string; rain: number; level: number }[]
    description: string
}

export const dams: Dam[] = [
    {
        id: 'soyang',
        damCode: '1012110',
        name: '소양강댐',
        region: '강원 춘천',
        river: '소양강',
        level: 78.4,
        prevLevel: 75.1,
        capacity: 2900,
        lat: 37.9, lng: 127.7,
        status: 'good',
        inflow: 1240, outflow: 890,
        weeklyData: [
            { day: '8/12', rain: 22, level: 72.1 },
            { day: '8/13', rain: 45, level: 73.8 },
            { day: '8/14', rain: 31, level: 74.9 },
            { day: '8/15', rain: 8,  level: 75.1 },
            { day: '8/16', rain: 62, level: 76.8 },
            { day: '8/17', rain: 28, level: 77.9 },
            { day: '8/18', rain: 12, level: 78.4 },
        ],
        description: '한강 수계 최대 다목적댐. 수도권 용수 공급과 홍수 조절의 핵심 시설입니다.',
    },
    {
        id: 'chungju',
        damCode: '1003110',
        name: '충주댐',
        region: '충북 충주',
        river: '남한강',
        level: 61.2,
        prevLevel: 63.0,
        capacity: 2750,
        lat: 37.0, lng: 128.0,
        status: 'normal',
        inflow: 560, outflow: 720,
        weeklyData: [
            { day: '8/12', rain: 10, level: 64.2 },
            { day: '8/13', rain: 5,  level: 63.8 },
            { day: '8/14', rain: 0,  level: 63.3 },
            { day: '8/15', rain: 0,  level: 63.0 },
            { day: '8/16', rain: 18, level: 62.8 },
            { day: '8/17', rain: 3,  level: 61.9 },
            { day: '8/18', rain: 0,  level: 61.2 },
        ],
        description: '남한강 최대 다목적댐. 충청·수도권 전력 생산과 홍수 조절을 담당합니다.',
    },
    {
        id: 'andong',
        damCode: '2001110',
        name: '안동댐',
        region: '경북 안동',
        river: '낙동강',
        level: 45.7,
        prevLevel: 47.2,
        capacity: 1248,
        lat: 36.6, lng: 128.9,
        status: 'caution',
        inflow: 180, outflow: 310,
        weeklyData: [
            { day: '8/12', rain: 4,  level: 48.1 },
            { day: '8/13', rain: 0,  level: 47.8 },
            { day: '8/14', rain: 0,  level: 47.5 },
            { day: '8/15', rain: 0,  level: 47.2 },
            { day: '8/16', rain: 0,  level: 46.8 },
            { day: '8/17', rain: 6,  level: 46.1 },
            { day: '8/18', rain: 0,  level: 45.7 },
        ],
        description: '낙동강 상류 다목적댐. 경북·경남 지역 농업용수의 핵심 수원입니다.',
    },
    {
        id: 'daecheong',
        damCode: '3008110',
        name: '대청댐',
        region: '충남 대전',
        river: '금강',
        level: 83.1,
        prevLevel: 79.4,
        capacity: 1490,
        lat: 36.4, lng: 127.5,
        status: 'surplus',
        inflow: 1820, outflow: 980,
        weeklyData: [
            { day: '8/12', rain: 55, level: 76.2 },
            { day: '8/13', rain: 88, level: 78.9 },
            { day: '8/14', rain: 42, level: 80.1 },
            { day: '8/15', rain: 15, level: 80.8 },
            { day: '8/16', rain: 71, level: 82.0 },
            { day: '8/17', rain: 33, level: 82.7 },
            { day: '8/18', rain: 18, level: 83.1 },
        ],
        description: '금강 최대 다목적댐. 대전·세종·충청 지역 생활용수를 책임집니다.',
    },
    {
        id: 'hapcheon',
        damCode: '2015110',
        name: '합천댐',
        region: '경남 합천',
        river: '황강',
        level: 52.3,
        prevLevel: 51.8,
        capacity: 790,
        lat: 35.6, lng: 128.1,
        status: 'normal',
        inflow: 290, outflow: 260,
        weeklyData: [
            { day: '8/12', rain: 8,  level: 51.2 },
            { day: '8/13', rain: 12, level: 51.5 },
            { day: '8/14', rain: 0,  level: 51.6 },
            { day: '8/15', rain: 0,  level: 51.8 },
            { day: '8/16', rain: 22, level: 52.1 },
            { day: '8/17', rain: 5,  level: 52.2 },
            { day: '8/18', rain: 0,  level: 52.3 },
        ],
        description: '황강 다목적댐. 경남 서부 지역의 농업용수와 생활용수를 공급합니다.',
    },
]


export const damStatusConfig: Record<DamStatus, { label: string; color: string; bg: string; border: string; emoji: string }> = {
    surplus: { label: '홍수 주의',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '🚨' },
    good:    { label: '양호',       color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD', emoji: '✅' },
    normal:  { label: '보통',       color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', emoji: '🔵' },
    caution: { label: '관심',       color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', emoji: '⚠️' },
    warning: { label: '경보',       color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '🚨' },
}

