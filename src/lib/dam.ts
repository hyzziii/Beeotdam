import { Dam, DamStatus } from '@/data';

/** 홍수기 제한 수위(%). 저수율 진행바에 눈금으로 표시된다. */
export const FLOOD_LIMIT_PERCENT = 80;

/**
 * '양호'로 묶이는 상태.
 * surplus는 라벨이 '홍수 주의'라서 안전군이 아니라 주의군에 들어간다.
 */
const SAFE_STATUSES: DamStatus[] = ['good', 'normal'];

export function isSafe(dam: Dam) {
  return SAFE_STATUSES.includes(dam.status);
}

/** 전일 대비 저수율 증감(%p). 부동소수 오차가 남으므로 표시할 때 반올림한다. */
export function damDelta(dam: Dam) {
  return dam.level - dam.prevLevel;
}

export function nationalAverageLevel(list: Dam[]) {
  if (list.length === 0) return 0;
  return list.reduce((sum, dam) => sum + dam.level, 0) / list.length;
}

export function safeCount(list: Dam[]) {
  return list.filter(isSafe).length;
}

export function cautionCount(list: Dam[]) {
  return list.length - safeCount(list);
}

export type DamFilter = 'all' | 'safe' | 'caution';

export function filterDams(list: Dam[], filter: DamFilter) {
  if (filter === 'all') return list;
  if (filter === 'safe') return list.filter(isSafe);
  return list.filter((dam) => !isSafe(dam));
}

/**
 * 1240 -> "1,240".
 * Hermes의 toLocaleString은 Intl 빌드에 따라 자릿수 구분이 빠질 수 있어 직접 넣는다.
 */
export function withThousands(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
