import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DamLevelList } from '@/components/home/dam-level-list';
import { RegionPicker } from '@/components/region/region-picker';
import { HourlyRainCard } from '@/components/home/hourly-rain-card';
import { WeeklyWeatherList } from '@/components/home/weekly-weather-list';
import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { useSettings } from '@/settings/settings-context';

export default function HomeScreen() {
  const styles = useStyles();

  const { activeRegion } = useSettings();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.location}>
              📍 {activeRegion.district}, {activeRegion.sido}
            </Text>
            <Text style={styles.date}>2026년 8월 18일 · 오후 2:32</Text>
          </View>

          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.locationButton, pressed && styles.locationPressed]}>
            <Text style={styles.locationButtonText}>지역 변경</Text>
          </Pressable>
        </View>

        {/* 현재 날씨 */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <View>
              <Text style={styles.temperature}>23°</Text>
              <Text style={styles.weatherDescription}>흐리고 비</Text>
              <Text style={styles.temperatureInfo}>최고 23° · 최저 16° · 체감 21°C</Text>
            </View>

            <Text style={styles.weatherIcon}>🌧️</Text>
          </View>

          <View style={styles.weatherStats}>
            <WeatherStat icon="☔" value="75%" label="강수확률" />
            <WeatherStat icon="💧" value="32mm" label="예상 강수량" />
            <WeatherStat icon="💦" value="82%" label="습도" />
          </View>
        </View>

        {/* 우산 알림 */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>☂️ 우산 챙기세요!</Text>
          <Text style={styles.alertText}>
            11시~15시 비가 와요. 14시에 강수확률이 85%로 가장 높아요.
          </Text>
        </View>

        <HourlyRainCard />
        <DamLevelList />
        <WeeklyWeatherList />
      </ScrollView>

      <RegionPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </SafeAreaView>
  );
}

function WeatherStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  const styles = useStyles();

  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  locationPressed: {
    opacity: 0.7,
  },
  safeArea: {
    flex: 1,
    backgroundColor: c.screen,
  },

  container: {
    padding: AppSpacing.screenPad,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  location: {
    fontSize: 16,
    fontWeight: '800',
    color: c.title,
  },

  date: {
    marginTop: 3,
    fontSize: 11,
    color: c.muted,
  },

  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.accentBorder,
    backgroundColor: c.accentSurface,
  },

  locationButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.accentText,
  },

  weatherCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: c.accentDeep,
    marginBottom: AppSpacing.cardGap,
  },

  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  temperature: {
    fontSize: 52,
    fontWeight: '300',
    color: '#FFFFFF',
  },

  weatherDescription: {
    marginTop: -4,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  temperatureInfo: {
    marginTop: 5,
    fontSize: 11,
    color: '#E5F2FF',
  },

  weatherIcon: {
    fontSize: 52,
  },

  weatherStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  statIcon: {
    fontSize: 16,
  },

  statValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#E5F2FF',
  },

  alertCard: {
    padding: 14,
    borderRadius: AppRadius.card,
    backgroundColor: c.alertSurface,
    borderWidth: 1,
    borderColor: c.alertBorder,
    marginBottom: AppSpacing.cardGap,
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: c.alertTitle,
  },

  alertText: {
    marginTop: 5,
    lineHeight: 18,
    fontSize: 12,
    color: c.alertBody,
  },
}));
