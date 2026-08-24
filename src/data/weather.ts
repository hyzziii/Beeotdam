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
