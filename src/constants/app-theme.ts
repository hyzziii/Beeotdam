/**
 * 앱 공용 디자인 토큰. 홈·수자원·날씨·설정 네 화면이 모두 쓴다.
 *
 * `constants/theme.ts`의 Spacing(4/8/16/24/32/64)은 웹 탭바가 쓰고 있어 건드릴 수 없고,
 * Figma의 촘촘한 여백(6/10/14)을 표현하지도 못해 이 파일을 따로 뒀다.
 */

export const AppColors = {
  screen: '#F4F8FC',
  card: '#FFFFFF',
  cardBorder: '#E9EFF6',

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

  up: '#2D8FE8',
  down: '#F59E0B',
} as const;

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
