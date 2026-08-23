import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, ApiFailureKind } from '@/api/http';
import { CurrentWeather, Forecast, HourlyRain, fetchCurrentWeather, fetchForecast } from '@/api/kma';
import { Region } from '@/data';
import { dayExtremesKey, loadValue, saveValue, weatherCacheKey } from '@/lib/storage';
import { useSettings } from '@/settings/settings-context';

/** 화면이 보여줄 한 지역의 날씨 한 벌. */
interface WeatherData {
  current: CurrentWeather;
  forecast: Forecast;
}

/**
 * 저장 형태 번호.
 *
 * WeatherData의 모양이 바뀌면 올린다. 예전 형태를 그대로 읽으면 없는 필드를 건드려
 * 터진다 — hourlyToday를 뒤늦게 추가했을 때 실제로 그런 일이 있었다. 번호가 다르면
 * 캐시를 버리고 새로 받는다.
 */
const CACHE_VERSION = 2;

/** 캐시에 저장하는 형태. 언제 받은 값인지 함께 남겨야 화면에 기준 시각을 쓸 수 있다. */
interface CachedWeather {
  version?: number;
  data: WeatherData;
  fetchedAt: number;
}

/**
 * 오늘 하루의 최고·최저기온.
 *
 * 예보에서 지나간 값이 빠져도 화면에 계속 보여주기 위해 따로 남긴다. date가 바뀌면
 * 어제 값이므로 버린다.
 */
interface DayExtremes {
  /** YYYYMMDD */
  date: string;
  high: number | null;
  low: number | null;
  /**
   * 오늘 06~20시 중 지금까지 본 시간별 값.
   *
   * 기상청이 지나간 시각을 빼기 때문에, 차트에 오늘 하루를 그리려면 예전에 받은 것을
   * 들고 있어야 한다. 그날 처음 켠 시각 이전은 채울 방법이 없어 비어 있다.
   */
  hourly?: HourlyRain[];
}

/** 오늘 하루의 시간별 값. */
export interface TodayHourly {
  entries: HourlyRain[];
}

/** 화면에 보여줄 오늘의 최고·최저. */
export interface TodayTemperature {
  high: number | null;
  low: number | null;
  /**
   * 하루 전체가 아니라 남아 있는 시간대만으로 낸 값이면 true.
   * 오늘 처음 켠 시각이 이미 저녁이라 지나간 값을 기억해 둘 기회가 없었을 때 그렇다.
   */
  partial: boolean;
}

/**
 * 어느 지역의 상태인지 함께 들고 다닌다.
 *
 * 지역이 바뀔 때 값을 지우는 대신 이렇게 두면, 지금 보는 지역과 코드가 다른 순간
 * 자동으로 '아직 없음'이 된다. 지우는 방식은 effect에서 상태를 건드리게 되어 렌더가
 * 한 번 더 돌고, 지우기 전 한 프레임 동안 이전 지역 값이 보인다.
 */
interface RegionState {
  regionCode: string;
  data: WeatherData | null;
  fetchedAt: number | null;
  loading: boolean;
  error: ApiFailureKind | null;
  /** 지나간 값까지 합친 오늘의 최고·최저. */
  today: TodayTemperature | null;
  /** 지나간 시각까지 합친 오늘의 시간별 값. */
  todayHourly: TodayHourly | null;
  /** 오류 화면을 사용자가 닫았는지. 다음 실패 때 다시 뜬다. */
  dismissed: boolean;
}

type WeatherValue = {
  data: WeatherData | null;
  /** 값을 받아온 시각. 캐시에서 온 값이면 과거 시각이다. */
  fetchedAt: number | null;
  /** 지금 서버에서 받아오는 중인지. 캐시를 보여주면서도 true일 수 있다. */
  loading: boolean;
  /** 마지막 요청이 실패했다면 그 이유. 캐시가 있으면 화면은 캐시를 계속 보여준다. */
  error: ApiFailureKind | null;
  /** 보여줄 값이 아직 하나도 없는 상태. 이때만 스켈레톤을 그린다. */
  empty: boolean;
  /** 오늘의 최고·최저기온. 예보에서 빠진 값은 기억해 둔 것으로 메운다. */
  today: TodayTemperature | null;
  /** 오늘 06~20시. 지나간 시각은 기억해 둔 값으로 메운다. */
  todayHourly: TodayHourly | null;
  /** 오류 화면을 지금 보여줘야 하는지. 실패했고 아직 닫지 않았을 때 true. */
  showError: boolean;
  /** 오류 화면을 닫고 가지고 있는 값을 보여준다. */
  dismissError: () => void;
  refresh: () => void;
};

const WeatherContext = createContext<WeatherValue | null>(null);

/** 'YYYYMMDD'. 예보 응답의 fcstDate와 맞춰 비교하기 위한 형식이다. */
function ymd(date: Date) {
  const pad2 = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

/**
 * 예보에 남은 값과 기억해 둔 값을 합쳐 오늘의 최고·최저를 만든다.
 *
 * 우선순위는 이렇다.
 *   1. 이번 응답의 TMX/TMN — 가장 정확하다
 *   2. 지난번에 봐서 저장해 둔 값 — 이번 응답에서 빠진 것을 메운다
 *   3. 시간별 기온의 최고·최저 — 둘 다 없을 때. 남은 시간대만의 값이라 근사치다
 *
 * 저장된 값이 이번 응답보다 더 극단적이면 그쪽을 쓴다. 아침에 본 최저기온이 저녁
 * 예보의 최저보다 낮은 게 정상이고, 그게 하루 전체의 최저다.
 */
function mergeToday(
  forecast: Forecast,
  stored: DayExtremes | null,
  now: Date,
): TodayTemperature | null {
  const todayKey = ymd(now);
  const day = forecast.daily.find((entry) => entry.date === todayKey);
  if (!day) return null;

  const remembered = stored?.date === todayKey ? stored : null;

  const pickHigh = (a: number | null, b: number | null) =>
    a === null ? b : b === null ? a : Math.max(a, b);
  const pickLow = (a: number | null, b: number | null) =>
    a === null ? b : b === null ? a : Math.min(a, b);

  const high = pickHigh(day.high, remembered?.high ?? null);
  const low = pickLow(day.low, remembered?.low ?? null);

  return {
    high: high ?? day.hourlyHigh,
    low: low ?? day.hourlyLow,
    // 실제 TMX/TMN을 한 번도 못 받아 시간별 기온으로 때운 경우
    partial: high === null || low === null,
  };
}

/**
 * 예보에 남은 시간과 기억해 둔 시간을 합쳐 오늘 06~20시를 만든다.
 *
 * 같은 시각이 양쪽에 있으면 이번 응답을 쓴다. 예보는 계속 갱신되므로 새 값이 맞다.
 * 그날 처음 켠 시각 이전은 어디에도 없어 그냥 빠진다.
 */
function mergeHourly(
  forecast: Forecast,
  stored: DayExtremes | null,
  now: Date,
): TodayHourly | null {
  const todayKey = ymd(now);
  const remembered = stored?.date === todayKey ? (stored.hourly ?? []) : [];

  const byHour = new Map<string, HourlyRain>();
  for (const entry of remembered) byHour.set(entry.hour, entry);
  for (const entry of forecast.hourlyToday ?? []) byHour.set(entry.hour, entry);

  if (byHour.size === 0) return null;

  return { entries: [...byHour.values()].sort((a, b) => a.hour.localeCompare(b.hour)) };
}

/**
 * 보고 있는 지역의 날씨를 받아 온다.
 *
 * 캐시를 먼저 보여주고 뒤에서 새로 받아오는 방식이다. 앱을 켜자마자 지난번 값이 뜨므로
 * 기다리는 시간이 없고, 새 값이 도착하면 조용히 바뀐다. 대신 화면은 반드시 '언제 기준'
 * 인지를 함께 보여줘야 한다. 오래된 값을 현재값인 척 보여주면 안 된다.
 *
 * 실패해도 캐시는 지우지 않는다. 1시간 전 기온도 아무것도 없는 것보다는 쓸모 있다.
 */
export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { activeRegion } = useSettings();

  const [state, setState] = useState<RegionState | null>(null);

  /**
   * 지금 어느 지역을 불러오는 중인지. 지역을 빠르게 바꾸면 먼저 보낸 요청이 나중에
   * 도착할 수 있는데, 그 결과를 그대로 쓰면 엉뚱한 지역 날씨가 표시된다.
   */
  const requested = useRef(activeRegion.code);

  const load = useCallback(async (region: Region, { useCache }: { useCache: boolean }) => {
    requested.current = region.code;

    const key = weatherCacheKey(region.code);

    const extremesKey = dayExtremesKey(region.code);

    if (useCache) {
      /*
       * 캐시 때문에 앱이 죽는 일은 없어야 한다. 지난번에 저장한 값의 모양이 지금 코드와
       * 안 맞으면 없는 필드를 건드려 터질 수 있는데, 그건 새로 받아오면 되는 일이라
       * 화면을 못 쓰게 만들 이유가 없다. 번호로 한 번 걸러내고, 그래도 새면 여기서 잡는다.
       */
      try {
        await showCached();
      } catch {
        // 캐시를 못 읽었을 뿐이다. 아래에서 새로 받아온다.
      }
    }

    async function showCached() {
      const [rawCache, stored] = await Promise.all([
        loadValue<CachedWeather>(key),
        loadValue<DayExtremes>(extremesKey),
      ]);

      // 형식이 다른 캐시는 없는 것으로 친다
      const cached = rawCache?.version === CACHE_VERSION ? rawCache : null;

      // 기다리는 동안 지역이 또 바뀌었으면 이 결과는 버린다
      if (cached && requested.current === region.code) {
        setState({
          regionCode: region.code,
          data: cached.data,
          fetchedAt: cached.fetchedAt,
          loading: true,
          error: null,
          today: mergeToday(cached.data.forecast, stored, new Date(cached.fetchedAt)),
          todayHourly: mergeHourly(cached.data.forecast, stored, new Date(cached.fetchedAt)),
          dismissed: false,
        });
      }
    }

    try {
      const now = new Date();
      // 실황과 예보는 서로 기다릴 필요가 없어 동시에 던진다
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(region, now),
        fetchForecast(region, now),
      ]);

      if (requested.current !== region.code) return;

      const fresh: WeatherData = { current, forecast };
      const stamp = now.getTime();

      const stored = await loadValue<DayExtremes>(extremesKey);
      const today = mergeToday(forecast, stored, now);
      const todayHourly = mergeHourly(forecast, stored, now);

      setState({
        regionCode: region.code,
        data: fresh,
        fetchedAt: stamp,
        loading: false,
        error: null,
        today,
        todayHourly,
        dismissed: false,
      });

      saveValue<CachedWeather>(key, { version: CACHE_VERSION, data: fresh, fetchedAt: stamp });

      // 오늘 본 것은 남겨 둔다. 기온 근사치는 저장하지 않는다 —
      // 저장하면 다음에도 그 값이 하루 전체 값처럼 쓰인다.
      saveValue<DayExtremes>(extremesKey, {
        date: ymd(now),
        high: today && !today.partial ? today.high : (stored?.date === ymd(now) ? stored.high : null),
        low: today && !today.partial ? today.low : (stored?.date === ymd(now) ? stored.low : null),
        hourly: todayHourly?.entries,
      });
    } catch (caught) {
      if (requested.current !== region.code) return;

      const kind = caught instanceof ApiError ? caught.kind : 'server';
      // 실패해도 이미 있는 값은 그대로 둔다. 캐시가 있으면 그걸 계속 보여준다.
      setState((prev) =>
        prev && prev.regionCode === region.code
          ? // 새로 실패했으니 닫아 뒀던 오류 화면을 다시 띄운다
            { ...prev, loading: false, error: kind, dismissed: false }
          : {
              regionCode: region.code,
              data: null,
              fetchedAt: null,
              loading: false,
              error: kind,
              today: null,
              todayHourly: null,
              dismissed: false,
            },
      );
    }
  }, []);

  useEffect(() => {
    /*
     * 규칙은 load 안에 setState가 있다는 것만 보고 동기 호출로 판단하는데, load는 async라
     * 상태 변경이 전부 await 뒤에서 일어난다. 렌더가 연쇄되지 않으므로 오탐이다.
     *
     * 바깥에서 온 값(지역)에 맞춰 서버에서 받아오는 일은 effect가 맡는 게 맞다.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(activeRegion, { useCache: true });
  }, [activeRegion, load]);

  const dismissError = useCallback(() => {
    setState((prev) => (prev ? { ...prev, dismissed: true } : prev));
  }, []);

  const refresh = useCallback(() => {
    // 손으로 새로고침할 때는 캐시를 다시 읽을 이유가 없다. 이미 화면에 있다.
    load(activeRegion, { useCache: false });
  }, [activeRegion, load]);

  const value = useMemo<WeatherValue>(() => {
    // 다른 지역의 상태는 없는 것으로 친다. 지역을 바꾼 직후가 여기에 해당한다.
    const matched = state?.regionCode === activeRegion.code ? state : null;

    return {
      data: matched?.data ?? null,
      fetchedAt: matched?.fetchedAt ?? null,
      // 아직 이 지역 상태가 없다면 방금 불러오기 시작한 참이다
      loading: matched ? matched.loading : true,
      error: matched?.error ?? null,
      empty: !matched?.data,
      today: matched?.today ?? null,
      todayHourly: matched?.todayHourly ?? null,
      showError: matched?.error != null && !matched.dismissed,
      dismissError,
      refresh,
    };
  }, [state, activeRegion.code, dismissError, refresh]);

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const value = useContext(WeatherContext);
  if (!value) throw new Error('WeatherProvider 안에서만 쓸 수 있습니다.');
  return value;
}
