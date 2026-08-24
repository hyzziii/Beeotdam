/**
 * 변하지 않는 값 모음. 도메인별로 나눠 두고 여기서 다시 내보내므로
 * 사용하는 쪽은 계속 `@/data` 한 곳만 바라보면 된다.
 *
 * 저수율·기온처럼 계속 바뀌는 값은 여기 두지 않는다. 그건 API에서 받아 오고,
 * 받아 온 값은 각 컨텍스트가 들고 있는다.
 */
export * from './dam-catalog'
export * from './region-dams'
export * from './regions'
export * from './mid-regions'
export * from './air-stations'
export * from './settings'
