import { ScrollView, Text, View } from 'react-native';
import { createStyles, useThemeControl } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInfoCard } from '@/components/settings/app-info-card';
import { DisplayCard } from '@/components/settings/display-card';
import { NotificationCard } from '@/components/settings/notification-card';
import { RegionCard } from '@/components/settings/region-card';
import { AppSpacing } from '@/constants/app-theme';
import { appInfo } from '@/data';
import { useSettings } from '@/settings/settings-context';

export default function SettingsScreen() {
  const styles = useStyles();

  // 설정값은 화면 로컬 상태가 아니라 앱 전역 Provider가 들고 기기에 저장한다
  const { selectedRegions, toggleRegion, notifications, toggleNotification, unit, setUnit } =
    useSettings();
  const { preference, setPreference } = useThemeControl();

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
