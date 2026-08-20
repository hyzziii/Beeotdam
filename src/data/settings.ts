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
