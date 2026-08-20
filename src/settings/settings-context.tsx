import { createContext, useContext, useMemo } from 'react';

import { TempUnit } from '@/components/settings/display-card';
import { DEFAULT_REGION_CODE, MAX_REGIONS, Region, findRegion, notificationOptions } from '@/data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { StorageKeys } from '@/lib/storage';

/** 알림 항목별 on/off. 키는 notificationOptions의 id. */
type NotificationState = Record<string, boolean>;

const defaultNotifications: NotificationState = Object.fromEntries(
  notificationOptions.map((option) => [option.id, option.defaultOn]),
);

const defaultRegions = [DEFAULT_REGION_CODE];

type SettingsValue = {
  /** 홈이 보여주는 지역. 관심 지역에 없어도 볼 수 있다. */
  activeRegion: Region;
  setActiveRegion: (code: string) => void;
  /** 관심 지역 코드들. 별표로 담고 뺀다. */
  selectedRegions: string[];
  toggleRegion: (code: string) => void;
  /** 관심 지역이 꽉 차 더 담을 수 없으면 true. */
  regionsFull: boolean;
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
  const [activeRegionCode, setActiveRegion, activeLoaded] = usePersistedState<string>(
    StorageKeys.activeRegion,
    DEFAULT_REGION_CODE,
  );
  const [selectedRegions, setSelectedRegions, regionsLoaded] = usePersistedState<string[]>(
    StorageKeys.selectedRegions,
    defaultRegions,
  );
  const [notifications, setNotifications, notificationsLoaded] =
    usePersistedState<NotificationState>(StorageKeys.notifications, defaultNotifications);
  const [unit, setUnit, unitLoaded] = usePersistedState<TempUnit>(StorageKeys.tempUnit, 'c');

  const value = useMemo<SettingsValue>(
    () => ({
      // 저장된 코드가 목록에 없을 수 있다. 행정구역이 개편되면 예전 코드가 남으므로
      // 그때는 기본 지역으로 되돌린다. 이 값은 항상 실재하는 지역이어야 한다.
      activeRegion: findRegion(activeRegionCode) ?? findRegion(DEFAULT_REGION_CODE)!,
      setActiveRegion,
      selectedRegions,
      regionsFull: selectedRegions.length >= MAX_REGIONS,
      toggleRegion: (code: string) =>
        setSelectedRegions((prev) => {
          if (prev.includes(code)) return prev.filter((item) => item !== code);
          // 한도를 넘기면 조용히 무시한다. 화면이 미리 막지만 여기서도 지킨다.
          return prev.length >= MAX_REGIONS ? prev : [...prev, code];
        }),
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
      ready: activeLoaded && regionsLoaded && notificationsLoaded && unitLoaded,
    }),
    [
      activeRegionCode,
      setActiveRegion,
      selectedRegions,
      setSelectedRegions,
      notifications,
      setNotifications,
      unit,
      setUnit,
      activeLoaded,
      regionsLoaded,
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
