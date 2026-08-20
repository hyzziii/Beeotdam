import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 기기 디스크에 값을 저장하고 읽어온다.
 *
 * AsyncStorage는 문자열만 다루므로 JSON 변환을 여기서 처리하고, 키에도 앱 접두사를
 * 붙여 다른 라이브러리가 쓰는 키와 섞이지 않게 한다. 저장소를 나중에 갈아끼우더라도
 * 사용하는 쪽은 이 파일만 바라보므로 import는 바뀌지 않는다.
 */

const PREFIX = 'beeotdam:';

const withPrefix = (key: string) => `${PREFIX}${key}`;

/**
 * 저장된 값을 읽는다. 값이 없거나 읽기에 실패하면 null.
 *
 * 저장소 오류로 앱이 죽으면 안 되므로 삼키고 null을 돌려준다. 호출하는 쪽은 그때
 * 기본값을 쓰면 된다. 앱 버전이 올라가며 저장된 형태가 바뀌었을 때도 JSON.parse가
 * 던질 수 있어 같은 처리로 흡수된다.
 */
export async function loadValue<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(withPrefix(key));
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** 값을 저장한다. 실패해도 조용히 넘어간다 — 다음 저장 때 다시 시도된다. */
export async function saveValue<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(withPrefix(key), JSON.stringify(value));
  } catch {
    // 저장 실패는 화면에 알릴 만한 일이 아니다. 메모리 상태는 이미 갱신돼 있다.
  }
}

/** 저장 키 모음. 문자열을 여기저기 적으면 오타로 값이 사라지므로 한곳에 모은다. */
export const StorageKeys = {
  themePreference: 'theme-preference',
  /** 홈이 보여주는 지역 하나. */
  activeRegion: 'active-region',
  /** 최근 본 지역 코드들. 최근 것이 앞이다. */
  recentRegions: 'recent-regions',
  notifications: 'notifications',
  tempUnit: 'temp-unit',
} as const;

/**
 * 지역별 날씨 캐시 키.
 *
 * 마지막으로 받아온 값을 저장해 두고 다음 실행 때 즉시 보여준다. 지역마다 따로
 * 저장하므로 지역을 옮겨 다녀도 각자의 마지막 값이 남는다.
 */
export function weatherCacheKey(regionCode: string) {
  return `weather:${regionCode}`;
}

/**
 * 지역별 '오늘의 최고·최저기온' 키.
 *
 * 기상청은 지나간 시각을 예보에서 빼므로, 저녁에 조회하면 오늘 최저기온(새벽 6시 값)이
 * 사라진다. 날씨 앱들이 오늘 최고·최저를 하루 종일 보여줄 수 있는 건 지나간 값을 들고
 * 있기 때문이다. 우리도 한 번 본 값을 그날이 끝날 때까지 남겨 둔다.
 */
export function dayExtremesKey(regionCode: string) {
  return `day-extremes:${regionCode}`;
}
