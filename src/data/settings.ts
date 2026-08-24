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
    dataSource: '기상청 · K-water · 에어코리아 공식 데이터 연동',
    links: ['이용약관', '개인정보처리방침', '오픈소스'],
}

/**
 * 데이터 출처.
 *
 * 공공데이터포털에서 받은 공공저작물이고, 기관마다 이용허락범위가 다르다. 화면에 출처를
 * 밝히는 건 선택이 아니라 조건이다 — 기상청과 한국환경공단이 출처표시를 요구한다.
 *
 * 공공누리 유형은 2026년 8월 각 서비스 페이지에서 확인한 값이다. 바뀔 수 있으니
 * 배포 전에 다시 본다.
 */
export interface DataSource {
    /** 제공기관. */
    agency: string
    /** 이용허락범위. 공공누리 유형과 조건. */
    license: string
    /** 그 기관에서 쓰는 서비스들. */
    services: string[]
}

export const dataSources: DataSource[] = [
    {
        agency: '기상청',
        license: '공공누리 제1유형 (출처표시)',
        services: ['단기예보 조회서비스', '중기예보 조회서비스'],
    },
    {
        agency: '한국수자원공사',
        license: '이용허락범위 제한 없음',
        services: ['수문 운영 정보'],
    },
    {
        agency: '한국환경공단',
        license: '공공누리 제3유형 (출처표시·변경금지)',
        services: ['에어코리아 대기오염정보', '에어코리아 측정소정보'],
    },
]
