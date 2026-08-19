export type DamStatus = 'surplus' | 'good' | 'normal' | 'caution' | 'warning'

export interface Dam {
    id: string
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

export const hourlyRain = [
    { hour: '06시', prob: 10, amount: 0 },
    { hour: '07시', prob: 15, amount: 0 },
    { hour: '08시', prob: 20, amount: 0.2 },
    { hour: '09시', prob: 35, amount: 0.8 },
    { hour: '10시', prob: 55, amount: 2.1 },
    { hour: '11시', prob: 65, amount: 3.4 },
    { hour: '12시', prob: 75, amount: 5.2 },
    { hour: '13시', prob: 80, amount: 6.8 },
    { hour: '14시', prob: 85, amount: 7.5 },
    { hour: '15시', prob: 70, amount: 4.2 },
    { hour: '16시', prob: 55, amount: 2.0 },
    { hour: '17시', prob: 40, amount: 0.9 },
    { hour: '18시', prob: 25, amount: 0.3 },
    { hour: '19시', prob: 15, amount: 0 },
    { hour: '20시', prob: 10, amount: 0 },
]

export const weeklyWeather = [
    { day: '오늘',  short: '화', icon: '🌧', high: 23, low: 16, rain: 75, desc: '비' },
    { day: '내일',  short: '수', icon: '🌦', high: 24, low: 17, rain: 55, desc: '가끔 비' },
    { day: '모레',  short: '목', icon: '⛅', high: 26, low: 17, rain: 20, desc: '구름 많음' },
    { day: '금요일', short: '금', icon: '☀️', high: 29, low: 19, rain: 5,  desc: '맑음' },
    { day: '토요일', short: '토', icon: '☀️', high: 30, low: 20, rain: 5,  desc: '맑음' },
    { day: '일요일', short: '일', icon: '⛅', high: 27, low: 19, rain: 25, desc: '구름 조금' },
    { day: '다음주 월', short: '월', icon: '🌧', high: 22, low: 16, rain: 80, desc: '비' },
]

export const damStatusConfig: Record<DamStatus, { label: string; color: string; bg: string; border: string; emoji: string }> = {
    surplus: { label: '홍수 주의',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '🚨' },
    good:    { label: '양호',       color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD', emoji: '✅' },
    normal:  { label: '보통',       color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', emoji: '🔵' },
    caution: { label: '관심',       color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', emoji: '⚠️' },
    warning: { label: '경보',       color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '🚨' },
}

export type AirGrade = '좋음' | '보통' | '나쁨' | '매우 나쁨'

export interface AirMetric {
    label: string
    reading: string
    grade: AirGrade
    /** 게이지 채움 비율 0~1 */
    ratio: number
}

export const airQuality: AirMetric[] = [
    // 미세먼지가 PM10, 초미세먼지가 PM2.5다. Figma 시안은 둘이 뒤바뀌어 있었다.
    { label: '미세먼지',   reading: 'PM10 32',     grade: '보통', ratio: 0.36 },
    { label: '초미세먼지', reading: 'PM2.5 18',    grade: '좋음', ratio: 0.22 },
    { label: '오존',       reading: '0.042 ppm',   grade: '좋음', ratio: 0.20 },
    { label: 'UV 지수',    reading: '3 (보통)',    grade: '보통', ratio: 0.30 },
]

export const airGradeConfig: Record<AirGrade, { color: string; bg: string }> = {
    '좋음':      { color: '#16A34A', bg: '#EAF7EF' },
    '보통':      { color: '#D97706', bg: '#FEF6E7' },
    '나쁨':      { color: '#EA580C', bg: '#FEF0E7' },
    '매우 나쁨': { color: '#DC2626', bg: '#FDECEC' },
}

export interface WeatherStat {
    icon: string
    value: string
    label: string
}

export const weatherStats: WeatherStat[] = [
    { icon: '🌀', value: '4.2 m/s',   label: '풍속 · 북동풍 ENE' },
    { icon: '💧', value: '82%',       label: '습도 · 매우 높음' },
    { icon: '🧭', value: '1008 hPa',  label: '기압 · 평년 수준' },
    { icon: '👁️', value: '5.2 km',    label: '가시거리 · 약간 흐림' },
    { icon: '🌅', value: '05:54',     label: '일출 · 오전' },
    { icon: '🌇', value: '19:28',     label: '일몰 · 오후' },
]

/** 시간별 목록에서 '현재' 배지를 붙일 시각. 샘플이라 고정값이다. */
export const currentHour = '09시'

export interface Region {
    id: string
    district: string
    city: string
}

export const regions: Region[] = [
    { id: 'gangnam',  district: '강남구',   city: '서울' },
    { id: 'haeundae', district: '해운대구', city: '부산' },
    { id: 'suseong',  district: '수성구',   city: '대구' },
    { id: 'yuseong',  district: '유성구',   city: '대전' },
    { id: 'yeonsu',   district: '연수구',   city: '인천' },
]

/** 관심 지역으로 담을 수 있는 최대 개수. */
export const MAX_REGIONS = 5

export interface NotificationOption {
    id: string
    icon: string
    title: string
    description: string
    /** 켜졌을 때 스위치 색. 알림 성격마다 다르다. */
    color: string
    /** 아이콘 배지 배경. */
    tint: string
    defaultOn: boolean
}

export const notificationOptions: NotificationOption[] = [
    {
        id: 'daily-summary',
        icon: '🌤️',
        title: '오늘의 날씨 요약',
        description: '매일 오전 7시 AI 요약 알림',
        color: '#F59E0B', tint: '#FEF3C7', defaultOn: true,
    },
    {
        id: 'rain-forecast',
        icon: '🌧️',
        title: '강수 예보 알림',
        description: '비 예상 1시간 전에 알림',
        color: '#3B9EFF', tint: '#DBEAFE', defaultOn: true,
    },
    {
        id: 'heavy-rain',
        icon: '⛈️',
        title: '집중호우 경보',
        description: '시간당 30㎜ 이상 예상 시',
        color: '#7C6CF0', tint: '#EDE9FE', defaultOn: true,
    },
    {
        id: 'dam-level',
        icon: '💧',
        title: '댐 저수율 알림',
        description: '저수율 40% 이하 또는 85% 초과',
        color: '#22B8E8', tint: '#CFFAFE', defaultOn: true,
    },
    {
        id: 'flood-release',
        icon: '🚨',
        title: '홍수·방류 경보',
        description: '댐 방류량 증가 시 즉시 알림',
        color: '#EF4444', tint: '#FEE2E2', defaultOn: true,
    },
    {
        id: 'drought',
        icon: '☀️',
        title: '가뭄 관심 알림',
        description: '저수율 30일 연속 감소 시',
        color: '#F59E0B', tint: '#FEF3C7', defaultOn: false,
    },
]

export const appInfo = {
    name: '비왔댐',
    version: '1.0.0',
    tagline: '내 지역의 비와 물 상황을 한눈에.',
    dataSource: '기상청 + K-water 공식 데이터 연동',
    links: ['이용약관', '개인정보처리방침', '오픈소스'],
}
