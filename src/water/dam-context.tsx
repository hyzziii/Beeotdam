import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, ApiFailureKind } from '@/api/http';
import { DamSnapshot, fetchDamSnapshot } from '@/api/kwater';
import {
  CatalogDam,
  DamRelation,
  Region,
  findCatalogDam,
  noRelationMessage,
  relatedDams,
} from '@/data';
import { damCacheKey, loadValue, saveValue } from '@/lib/storage';
import { useSettings } from '@/settings/settings-context';

/** 캐시에 저장하는 형태. 언제 받은 값인지 함께 남긴다. */
interface CachedDam {
  snapshot: DamSnapshot;
  fetchedAt: number;
}

/**
 * 화면에 보여줄 댐 한 곳.
 *
 * 댐마다 snapshot과 error를 따로 들고 있다. 한 댐이 실패했다고 나머지를 못 보여줄
 * 이유가 없고, 여러 댐의 저수율을 합치거나 평균내지도 않는다.
 */
export interface DamEntry {
  dam: CatalogDam;
  relation: DamRelation;
  /** 이 지역과 연결된 근거. */
  source: string;
  snapshot: DamSnapshot | null;
  fetchedAt: number | null;
  error: ApiFailureKind | null;
}

type DamsValue = {
  entries: DamEntry[];
  /** 지금 받아오는 중인지. 캐시를 보여주면서도 true일 수 있다. */
  loading: boolean;
  /**
   * 이 지역에 연결된 댐이 아예 없는지.
   *
   * 오류가 아니다. 제주는 지하수를 쓰고, 공식 근거를 아직 확인하지 못한 지역도 있다.
   */
  noRelation: boolean;
  /** 연결이 없을 때 보여줄 문구. 제주처럼 사정이 다른 지역은 다른 문구가 온다. */
  noRelationMessage: string;
  refresh: () => void;
};

const DamsContext = createContext<DamsValue | null>(null);

/** 지역에 연결된 댐 목록을 카탈로그와 맞춰 풀어낸다. */
function resolve(region: Region) {
  return relatedDams(region)
    .map((related) => {
      const dam = findCatalogDam(related.damId);
      return dam ? { dam, relation: related.relation, source: related.source } : null;
    })
    .filter((item) => item !== null);
}

/**
 * 보고 있는 지역과 연결된 댐의 저수율을 받아 온다.
 *
 * 날씨와 같은 방식이다. 캐시를 먼저 보여주고 뒤에서 새로 받아온다. 캐시는 지역이 아니라
 * 댐 단위로 두었다 — 한 댐이 여러 지역에 물을 대므로 지역을 옮겨도 다시 받을 필요가 없다.
 */
export function DamsProvider({ children }: { children: React.ReactNode }) {
  const { activeRegion } = useSettings();

  const [entries, setEntries] = useState<DamEntry[]>([]);
  const [loading, setLoading] = useState(false);

  /** 지역을 빠르게 바꿀 때 먼저 보낸 요청의 결과를 쓰지 않기 위한 표시. */
  const requested = useRef(activeRegion.code);

  const load = useCallback(async (region: Region, { useCache }: { useCache: boolean }) => {
    requested.current = region.code;

    const linked = resolve(region);
    if (linked.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (useCache) {
      const cached = await Promise.all(
        linked.map((item) => loadValue<CachedDam>(damCacheKey(item.dam.damCode))),
      );
      if (requested.current === region.code) {
        setEntries(
          linked.map((item, index) => ({
            ...item,
            snapshot: cached[index]?.snapshot ?? null,
            fetchedAt: cached[index]?.fetchedAt ?? null,
            error: null,
          })),
        );
      }
    }

    const now = new Date();
    // 한 댐이 실패해도 나머지는 보여준다
    const results = await Promise.allSettled(
      linked.map((item) => fetchDamSnapshot(item.dam.damCode, now)),
    );

    if (requested.current !== region.code) return;

    const stamp = now.getTime();
    setEntries(
      linked.map((item, index) => {
        const result = results[index];

        if (result.status === 'fulfilled') {
          saveValue<CachedDam>(damCacheKey(item.dam.damCode), {
            snapshot: result.value,
            fetchedAt: stamp,
          });
          return { ...item, snapshot: result.value, fetchedAt: stamp, error: null };
        }

        const kind: ApiFailureKind =
          result.reason instanceof ApiError ? result.reason.kind : 'server';
        return { ...item, snapshot: null, fetchedAt: null, error: kind };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    /*
     * load는 async라 상태 변경이 모두 await 뒤에서 일어난다. 규칙은 함수 안에 setState가
     * 있다는 것만 보고 동기 호출로 판단하므로 오탐이다.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(activeRegion, { useCache: true });
  }, [activeRegion, load]);

  const refresh = useCallback(() => {
    load(activeRegion, { useCache: false });
  }, [activeRegion, load]);

  const value = useMemo<DamsValue>(
    () => ({
      entries,
      loading,
      noRelation: resolve(activeRegion).length === 0,
      noRelationMessage: noRelationMessage(activeRegion),
      refresh,
    }),
    [entries, loading, activeRegion, refresh],
  );

  return <DamsContext.Provider value={value}>{children}</DamsContext.Provider>;
}

export function useDams() {
  const value = useContext(DamsContext);
  if (!value) throw new Error('DamsProvider 안에서만 쓸 수 있습니다.');
  return value;
}
