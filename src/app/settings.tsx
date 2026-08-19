import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles, useThemeControl } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInfoCard } from '@/components/settings/app-info-card';
import { DisplayCard, TempUnit } from '@/components/settings/display-card';
import { NotificationCard } from '@/components/settings/notification-card';
import { RegionCard } from '@/components/settings/region-card';
import { AppSpacing } from '@/constants/app-theme';
import { appInfo, notificationOptions } from '@/data';

const defaultNotifications = Object.fromEntries(
  notificationOptions.map((option) => [option.id, option.defaultOn]),
);

export default function SettingsScreen() {
  const styles = useStyles();

  // 샘플 화면이라 상태는 메모리에만 둔다. 저장소를 붙이면 여기서 읽고 쓴다.
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['gangnam']);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(defaultNotifications);
  const [unit, setUnit] = useState<TempUnit>('c');
  // 테마는 화면 로컬 상태가 아니라 앱 전역 Provider가 들고 있다
  const { preference, setPreference } = useThemeControl();

  const toggleRegion = (id: string) =>
    setSelectedRegions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const toggleNotification = (id: string, next: boolean) =>
    setNotifications((prev) => ({ ...prev, [id]: next }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.meta}>
          {appInfo.name} v{appInfo.version}
        </Text>

        <View style={styles.body}>
          <RegionCard selected={selectedRegions} onToggle={toggleRegion} />
          <NotificationCard enabled={notifications} onToggle={toggleNotification} />
          <DisplayCard
            unit={unit}
            onUnitChange={setUnit}
            theme={preference}
            onThemeChange={setPreference}
          />
          <AppInfoCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createStyles((c) => ({
  safeArea: {
    flex: 1,
    backgroundColor: c.screen,
  },
  container: {
    padding: AppSpacing.screenPad,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: c.title,
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: c.muted,
  },
  body: {
    marginTop: 14,
  },
}));
