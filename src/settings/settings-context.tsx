import { createContext, useContext, useMemo } from 'react';

import { TempUnit } from '@/components/settings/display-card';
import {
  DEFAULT_REGION_CODE,
  MAX_RECENT_REGIONS,
  Region,
  findRegion,
  notificationOptions,
} from '@/data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { StorageKeys } from '@/lib/storage';

/** 알림 항목별 on/off. 키는 notificationOptions의 id. */
type NotificationState = Record<string, boolean>;

const defaultNotifications: NotificationState = Object.fromEntries(
  notificationOptions.map((option) => [option.id, option.defaultOn]),
);

const defaultRecent = [DEFAULT_REGION_CODE];

type SettingsValue = {
  /** 홈이 보여주는 지역. */
  activeRegion: Region;
  /** 지역을 바꾼다. 최근 목록에도 자동으로 쌓인다. */
  setActiveRegion: (code: string) => void;
  /** 최근 본 지역. 최근 것이 앞이고 지금 보는 곳은 빠져 있다. */
  recentRegions: Region[];
  notifications: NotificationState;
  toggleNotification: (id: string, next: boolean) => void;
  unit: TempUnit;
  setUnit: (next: TempUnit) => void;
  /** 저장된 설정을 아직 읽는 중이면 false. */
  ready: boolean;
};

const SettingsContext = createContext<SettingsValue | null>(null);

/**
 * 설정 화면의 값을 앱 전역에서 들고 있으면서 기기에 저장한다.
 *
 * 테마를 ThemeProvider가 들고 있는 것과 같은 이유다. 저장·복원 로직이 화면 안에
 * 있으면 화면 코드가 지저분해지고, 나중에 다른 화면(예: 관심 지역으로 날씨를
 * 불러오는 홈)에서 같은 값이 필요해질 때 끌어올릴 곳이 없다.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [activeRegionCode, setActiveRegionCode, activeLoaded] = usePersistedState<string>(
    StorageKeys.activeRegion,
    DEFAULT_REGION_CODE,
  );
  /**
   * 기억해 두는 개수는 보여줄 개수보다 하나 많다.
   *
   * 지금 보는 지역은 '현재'로 따로 표시하므로 칩에서 뺀다. 딱 5개만 기억하면 그중
   * 하나가 항상 현재 지역이라 칩이 4개밖에 안 남는다.
   */
  const [recentCodes, setRecentCodes, recentLoaded] = usePersistedState<string[]>(
    StorageKeys.recentRegions,
    defaultRecent,
  );
  const [notifications, setNotifications, notificationsLoaded] =
    usePersistedState<NotificationState>(StorageKeys.notifications, defaultNotifications);
  const [unit, setUnit, unitLoaded] = usePersistedState<TempUnit>(StorageKeys.tempUnit, 'c');

  /**
   * 목록에 없는 코드는 버린다. 앱을 쓰던 중에 지역 데이터가 바뀌면(행정구역 개편 등)
   * 기기에는 예전 코드가 남는데, 그대로 두면 화면에 안 보이면서 자리만 차지한다.
   */
  const validRecent = useMemo(
    () => recentCodes.map(findRegion).filter((region) => region !== undefined),
    [recentCodes],
  );

  // 저장된 코드가 목록에 없으면 기본 지역으로 되돌린다. 이 값은 항상 실재해야 한다.
  const activeRegion = findRegion(activeRegionCode) ?? findRegion(DEFAULT_REGION_CODE)!;

  const value = useMemo<SettingsValue>(
    () => ({
      activeRegion,
      setActiveRegion: (code: string) => {
        setActiveRegionCode(code);
        // 최근 목록 맨 앞으로 올린다. 이미 있으면 자리를 옮기는 셈이고, 넘치면
        // 뒤에서 잘린다. 없는 코드는 이때 저장소에서도 함께 사라진다.
        setRecentCodes((prev) =>
          [code, ...prev.filter((item) => item !== code && findRegion(item))].slice(
            0,
            MAX_RECENT_REGIONS + 1,
          ),
        );
      },
      // 지금 보는 곳은 '현재'로 따로 보여주므로 빼고, 남은 것에서 앞의 다섯을 준다
      recentRegions: validRecent
        .filter((region) => region.code !== activeRegion.code)
        .slice(0, MAX_RECENT_REGIONS),
      notifications: {
        // 앱 업데이트로 알림 항목이 늘어나면 저장된 값에는 그 키가 없다.
        // 기본값을 깔고 저장된 값을 덮어 새 항목도 기본값으로 켜지게 한다.
        ...defaultNotifications,
        ...notifications,
      },
      toggleNotification: (id: string, next: boolean) =>
        setNotifications((prev) => ({ ...prev, [id]: next })),
      unit,
      setUnit,
      ready: activeLoaded && recentLoaded && notificationsLoaded && unitLoaded,
    }),
    [
      activeRegion,
      setActiveRegionCode,
      validRecent,
      setRecentCodes,
      notifications,
      setNotifications,
      unit,
      setUnit,
      activeLoaded,
      recentLoaded,
      notificationsLoaded,
      unitLoaded,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('SettingsProvider 안에서만 쓸 수 있습니다.');
  return value;
}
