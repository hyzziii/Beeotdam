import { createContext, useContext, useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { Palette, palettes } from '@/constants/app-theme';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { StorageKeys } from '@/lib/storage';

/** 사용자가 설정 화면에서 고르는 값. auto는 기기 설정을 따른다. */
export type ThemePreference = 'light' | 'dark' | 'auto';

type ThemeValue = {
  palette: Palette;
  /** auto를 기기 설정으로 풀어낸 실제 적용 테마. */
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** 저장된 설정을 아직 읽는 중이면 false. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference, ready] = usePersistedState<ThemePreference>(
    StorageKeys.themePreference,
    'auto',
  );

  const value = useMemo<ThemeValue>(() => {
    const scheme = preference === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return { palette: palettes[scheme], scheme, preference, setPreference, ready };
  }, [preference, systemScheme, setPreference, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeValue() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider 안에서만 쓸 수 있습니다.');
  return value;
}

/** 현재 팔레트만 필요할 때. */
export function useAppTheme() {
  return useThemeValue().palette;
}

/** 설정 화면처럼 테마를 바꿔야 할 때. */
export function useThemeControl() {
  const { preference, setPreference, scheme, ready } = useThemeValue();
  return { preference, setPreference, scheme, ready };
}

/**
 * 팔레트를 받아 스타일을 만드는 훅을 돌려준다.
 *
 * StyleSheet.create를 모듈 최상단에서 부르면 색이 앱 시작 시점에 굳어 테마 변경이
 * 반영되지 않는다. 그렇다고 매 렌더마다 새로 만들면 낭비이므로, 팔레트별로 한 번만
 * 만들어 캐시한다. 팔레트 객체는 모듈 상수라 참조가 그대로 유지된다.
 */
export function createStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Palette) => T) {
  const cache = new Map<Palette, T>();

  return function useStyles(): T {
    const palette = useAppTheme();
    let styles = cache.get(palette);
    if (!styles) {
      styles = StyleSheet.create(factory(palette));
      cache.set(palette, styles);
    }
    return styles;
  };
}
