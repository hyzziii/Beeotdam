import { createContext, useContext, useMemo } from 'react';

import { TempUnit } from '@/components/settings/display-card';
import { notificationOptions } from '@/data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { StorageKeys } from '@/lib/storage';

/** 알림 항목별 on/off. 키는 notificationOptions의 id. */
type NotificationState = Record<string, boolean>;

const defaultNotifications: NotificationState = Object.fromEntries(
  notificationOptions.map((option) => [option.id, option.defaultOn]),
);

const defaultRegions = ['gangnam'];

type SettingsValue = {
  selectedRegions: string[];
  toggleRegion: (id: string) => void;
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
  const [selectedRegions, setSelectedRegions, regionsLoaded] = usePersistedState<string[]>(
    StorageKeys.selectedRegions,
    defaultRegions,
  );
  const [notifications, setNotifications, notificationsLoaded] =
    usePersistedState<NotificationState>(StorageKeys.notifications, defaultNotifications);
  const [unit, setUnit, unitLoaded] = usePersistedState<TempUnit>(StorageKeys.tempUnit, 'c');

  const value = useMemo<SettingsValue>(
    () => ({
      selectedRegions,
      toggleRegion: (id: string) =>
        setSelectedRegions((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        ),
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
      ready: regionsLoaded && notificationsLoaded && unitLoaded,
    }),
    [
      selectedRegions,
      setSelectedRegions,
      notifications,
      setNotifications,
      unit,
      setUnit,
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
