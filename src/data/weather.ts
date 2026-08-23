export const weeklyWeather = [
    { day: '오늘',  short: '화', icon: '🌧', high: 23, low: 16, rain: 75, desc: '비' },
    { day: '내일',  short: '수', icon: '🌦', high: 24, low: 17, rain: 55, desc: '가끔 비' },
    { day: '모레',  short: '목', icon: '⛅', high: 26, low: 17, rain: 20, desc: '구름 많음' },
    { day: '금요일', short: '금', icon: '☀️', high: 29, low: 19, rain: 5,  desc: '맑음' },
    { day: '토요일', short: '토', icon: '☀️', high: 30, low: 20, rain: 5,  desc: '맑음' },
    { day: '일요일', short: '일', icon: '⛅', high: 27, low: 19, rain: 25, desc: '구름 조금' },
    { day: '다음주 월', short: '월', icon: '🌧', high: 22, low: 16, rain: 80, desc: '비' },
]


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
