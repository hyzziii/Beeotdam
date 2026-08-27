import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/** 구독할 외부 상태가 없다. 값이 서버/클라이언트 여부로만 갈리므로 해지 함수만 돌려준다. */
const noopSubscribe = () => () => {};

/**
 * 웹은 정적 렌더를 하므로 색 구성을 클라이언트에서 다시 계산해야 한다.
 *
 * 서버에서 그린 HTML은 시스템 설정을 알 수 없어 항상 라이트다. 클라이언트가 곧바로 다크로
 * 그리면 두 결과가 어긋나 하이드레이션이 깨진다. 그래서 첫 렌더는 라이트로 맞추고, 붙은
 * 뒤에 진짜 값으로 바꾼다.
 *
 * 전에는 useState + useEffect로 '붙었는지'를 표시했는데, effect 안에서 곧바로 setState를
 * 하는 모양이라 렌더가 한 번 더 도는 걸 규칙이 잡았다. useSyncExternalStore는 서버용
 * 스냅샷과 클라이언트용 스냅샷을 따로 받으므로 상태를 만들 필요가 없다.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true, // 클라이언트
    () => false, // 서버 렌더와 하이드레이션 첫 렌더
  );

  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
