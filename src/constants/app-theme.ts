/**
 * 앱 공용 디자인 토큰. 홈·수자원·날씨·설정 네 화면이 모두 쓴다.
 *
 * `constants/theme.ts`의 Spacing(4/8/16/24/32/64)은 웹 탭바가 쓰고 있어 건드릴 수 없고,
 * Figma의 촘촘한 여백(6/10/14)을 표현하지도 못해 이 파일을 따로 뒀다.
 *
 * 색은 팔레트로 나뉘어 있으니 직접 import하지 말고 `useAppTheme()`으로 꺼내 쓴다.
 * StyleSheet.create는 모듈 로드 때 한 번만 실행되므로, 색을 거기 직접 박으면
 * 테마를 바꿔도 반영되지 않는다. 스타일은 `createStyles`로 선언한다.
 */

export const lightPalette = {
  screen: '#F4F8FC',
  card: '#FFFFFF',
  cardBorder: '#E9EFF6',
  divider: '#F1F5F9',

  title: '#1B2635',
  body: '#41506A',
  muted: '#94A3B8',
  faint: '#B4C0CE',

  accent: '#3B9EFF',
  accentDeep: '#1E88E5',
  accentText: '#2D8FE8',
  accentSoft: '#EAF4FF',
  accentSurface: '#F1F7FE',
  accentBorder: '#DCEBFA',
  accentLegend: '#BFDFFF',

  track: '#E7EDF4',
  trackFilled: '#CBD5E1',
  segmentTrack: '#EDF2F8',

  // 우산 알림 카드
  alertSurface: '#FFFDF0',
  alertBorder: '#F5DE85',
  alertTitle: '#A66A00',
  alertBody: '#7A6200',

  up: '#2D8FE8',
  down: '#F59E0B',
} as const;

/** 키는 라이트 팔레트에서 가져오되 값은 임의의 색 문자열이어야 한다. */
export type Palette = Record<keyof typeof lightPalette, string>;

export const darkPalette: Palette = {
  screen: '#0E1520',
  card: '#18212F',
  cardBorder: '#26303F',
  divider: '#222C3A',

  title: '#EAF1F8',
  body: '#B4C2D4',
  muted: '#7A8899',
  faint: '#5E6B7C',

  // 어두운 배경에서는 같은 파랑이 과하게 튀어 한 단계 눌러 잡았다.
  accent: '#4BA6FF',
  accentDeep: '#2A7FD4',
  accentText: '#6FBBFF',
  accentSoft: '#1B2C42',
  accentSurface: '#16243A',
  accentBorder: '#2B4566',
  accentLegend: '#2F4C6E',

  track: '#26303F',
  trackFilled: '#3C4A5C',
  segmentTrack: '#212B39',

  alertSurface: '#2A2416',
  alertBorder: '#5A4A1E',
  alertTitle: '#E8C36A',
  alertBody: '#C9AE72',

  up: '#6FBBFF',
  down: '#F0A93B',
} as const;

export const palettes = { light: lightPalette, dark: darkPalette };

export const AppRadius = {
  card: 16,
  badge: 13,
  chip: 10,
  bar: 5,
} as const;

export const AppSpacing = {
  screenPad: 16,
  cardPad: 16,
  cardGap: 10,
  sectionHeaderGap: 8,
} as const;

/** 강수확률이 이 값 이상인 시간대만 파란색으로 강조한다. */
export const RAIN_HIGHLIGHT = 60;

/**
 * 퍼센트 문자열을 DimensionValue로 좁혀주는 헬퍼.
 * 인라인 스타일에서 `${n}%`는 string으로 넓어져 타입 에러가 나기 때문에 필요하다.
 */
export const pct = (value: number) => `${value}%` as `${number}%`;
