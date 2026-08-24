import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AirQuality, fetchAirQuality } from '@/api/airkorea';
import { ApiError, ApiFailureKind } from '@/api/http';
import { AirStation, Region, findAirStation } from '@/data';
import { airCacheKey, loadValue, saveValue } from '@/lib/storage';
import { useSettings } from '@/settings/settings-context';

interface CachedAir {
  data: AirQuality;
  fetchedAt: number;
}

type AirValue = {
  data: AirQuality | null;
  /** 어느 측정소 값인지. 지역과 이름이 달라 화면에 밝힌다. */
  station: AirStation | null;
  fetchedAt: number | null;
  loading: boolean;
  error: ApiFailureKind | null;
  /**
   * 이 지역에 쓸 측정소가 없는지.
   *
   * 오류가 아니다. 옹진군(백령도)처럼 가까운 측정소가 없는 지역이 있다.
   */
  noStation: boolean;
  refresh: () => void;
};

const AirContext = createContext<AirValue | null>(null);

/**
 * 보고 있는 지역의 대기질을 받아 온다.
 *
 * 날씨·댐과 같은 방식이다. 캐시를 먼저 보여주고 뒤에서 새로 받아온다. 캐시는 지역이
 * 아니라 측정소 단위로 두었다 — 한 측정소가 여러 지역을 대표하므로 옆 동네로 옮겨도
 * 다시 받을 필요가 없다.
 */
export function AirProvider({ children }: { children: React.ReactNode }) {
  const { activeRegion } = useSettings();

  const [state, setState] = useState<{
    stationKey: string;
    data: AirQuality | null;
    fetchedAt: number | null;
    loading: boolean;
    error: ApiFailureKind | null;
  } | null>(null);

  const requested = useRef('');

  const load = useCallback(async (region: Region, { useCache }: { useCache: boolean }) => {
    const station = findAirStation(region.code);
    if (!station) {
      /*
       * 여기서 상태를 비우지 않는다. 아래 useMemo가 지금 지역의 측정소 키와 들고 있는
       * 상태의 키를 비교하므로, 측정소가 없으면 자동으로 '값 없음'이 된다.
       * 비우려고 setState를 부르면 effect 안에서 동기 호출이 되어 렌더가 한 번 더 돈다.
       */
      requested.current = '';
      return;
    }

    const stationKey = `${station.sido}:${station.station}`;
    requested.current = stationKey;

    const key = airCacheKey(stationKey);

    async function showCached() {
      const cached = await loadValue<CachedAir>(key);
      // 기다리는 동안 지역이 또 바뀌었으면 이 결과는 버린다
      if (cached && requested.current === stationKey) {
        setState({
          stationKey,
          data: cached.data,
          fetchedAt: cached.fetchedAt,
          loading: true,
          error: null,
        });
      }
    }

    if (useCache) {
      try {
        await showCached();
      } catch {
        // 캐시를 못 읽었을 뿐이다. 아래에서 새로 받아온다.
      }
    }

    try {
      const data = await fetchAirQuality(station);
      if (requested.current !== stationKey) return;

      const stamp = Date.now();
      setState({ stationKey, data, fetchedAt: stamp, loading: false, error: null });
      saveValue<CachedAir>(key, { data, fetchedAt: stamp });
    } catch (caught) {
      if (requested.current !== stationKey) return;

      const kind: ApiFailureKind = caught instanceof ApiError ? caught.kind : 'server';
      setState((prev) =>
        prev && prev.stationKey === stationKey
          ? { ...prev, loading: false, error: kind }
          : { stationKey, data: null, fetchedAt: null, loading: false, error: kind },
      );
    }
  }, []);

  useEffect(() => {
    /*
     * load는 async라 상태 변경이 모두 await 뒤에서 일어난다. 규칙은 함수 안에 setState가
     * 있다는 것만 보고 동기 호출로 판단하므로 오탐이다. dam-context도 같다.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(activeRegion, { useCache: true });
  }, [activeRegion, load]);

  const refresh = useCallback(() => {
    load(activeRegion, { useCache: false });
  }, [activeRegion, load]);

  const value = useMemo<AirValue>(() => {
    const station = findAirStation(activeRegion.code) ?? null;
    const stationKey = station ? `${station.sido}:${station.station}` : '';
    // 다른 측정소의 값은 없는 것으로 친다. 지역을 바꾼 직후가 여기에 해당한다.
    const matched = state?.stationKey === stationKey ? state : null;

    return {
      data: matched?.data ?? null,
      station,
      fetchedAt: matched?.fetchedAt ?? null,
      loading: station !== null && !matched,
      error: matched?.error ?? null,
      noStation: station === null,
      refresh,
    };
  }, [state, activeRegion.code, refresh]);

  return <AirContext.Provider value={value}>{children}</AirContext.Provider>;
}

export function useAir() {
  const value = useContext(AirContext);
  if (!value) throw new Error('AirProvider 안에서만 쓸 수 있습니다.');
  return value;
}
