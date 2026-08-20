import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { loadValue, saveValue } from '@/lib/storage';

/**
 * useState와 똑같이 쓰지만 값이 기기에 저장되고, 앱을 다시 켜면 복원되는 훅.
 *
 * 디스크 읽기는 비동기라 첫 렌더에는 저장된 값을 아직 모른다. 그래서 initial로
 * 시작했다가 읽기가 끝나면 교체하고, 그 사이 화면이 기본값으로 번쩍이지 않도록
 * 세 번째 값 loaded를 함께 돌려준다. 호출하는 쪽은 loaded가 true가 될 때까지
 * 화면을 가려 두면 된다.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    loadValue<T>(key).then((stored) => {
      // 읽어오는 동안 화면이 사라졌다면 사라진 상태를 건드리지 않는다
      if (!alive) return;
      if (stored !== null) setValue(stored);
      setLoaded(true);
    });

    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    // 읽기가 끝나기 전에 저장하면 initial이 저장된 값을 덮어써 버린다
    if (!loaded) return;
    saveValue(key, value);
  }, [key, value, loaded]);

  return [value, setValue, loaded];
}
