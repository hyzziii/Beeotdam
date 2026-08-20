import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DamLevelList } from '@/components/home/dam-level-list';
import { RegionPicker } from '@/components/region/region-picker';
import { HourlyRainCard } from '@/components/home/hourly-rain-card';
import { WeeklyWeatherList } from '@/components/home/weekly-weather-list';
import { umbrellaAdvice } from '@/api/kma';
import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { useSettings } from '@/settings/settings-context';
import { useWeather } from '@/weather/weather-context';

export default function HomeScreen() {
  const styles = useStyles();

  const { activeRegion } = useSettings();
  const { data, fetchedAt, loading, error, empty } = useWeather();
  const [pickerOpen, setPickerOpen] = useState(false);

  const current = data?.current;
  const today = data?.forecast.daily[0];
  const hourly = data?.forecast.hourly;
  // 오늘 남은 시간 중 가장 높은 강수확률. 카드의 '강수확률'이 이 값이다.
  const peakProb = hourly?.length ? Math.max(...hourly.map((entry) => entry.prob)) : null;
  const totalRain = hourly?.reduce((sum, entry) => sum + entry.amount, 0) ?? null;
  // 비 소식이 없으면 null이라 카드를 아예 숨긴다
  const umbrella = hourly ? umbrellaAdvice(hourly) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.location}>
              📍 {activeRegion.district}, {activeRegion.sido}
            </Text>
            <Text style={styles.date}>{describeFreshness({ fetchedAt, loading, error })}</Text>
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
              {empty ? (
                <>
                  <Skeleton width={110} height={52} />
                  <View style={styles.skeletonGap}>
                    <Skeleton width={80} height={18} />
                  </View>
                  <View style={styles.skeletonGap}>
                    <Skeleton width={150} height={13} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.temperature}>{formatTemp(current?.temperature)}</Text>
                  <Text style={styles.weatherDescription}>{today?.desc ?? '—'}</Text>
                  <Text style={styles.temperatureInfo}>
                    최고 {formatTemp(today?.high)} · 최저 {formatTemp(today?.low)}
                  </Text>
                </>
              )}
            </View>

            <Text style={styles.weatherIcon}>{empty ? '　' : (today?.icon ?? '⛅')}</Text>
          </View>

          <View style={styles.weatherStats}>
            <WeatherStat
              icon="☔"
              value={peakProb === null ? '—' : `${peakProb}%`}
              label="강수확률"
              loading={empty}
            />
            <WeatherStat
              icon="💧"
              value={totalRain === null ? '—' : `${totalRain.toFixed(1)}mm`}
              label="예상 강수량"
              loading={empty}
            />
            <WeatherStat
              icon="💦"
              value={current?.humidity === null || current?.humidity === undefined ? '—' : `${current.humidity}%`}
              label="습도"
              loading={empty}
            />
          </View>
        </View>

        {/* 우산 알림. 비 올 시간대가 있을 때만 나온다. */}
        {umbrella && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>☂️ 우산 챙기세요!</Text>
            <Text style={styles.alertText}>
              {umbrella.from}~{umbrella.to} 비가 와요. {umbrella.peakHour}에 강수확률이{' '}
              {umbrella.peakProb}%로 가장 높아요.
            </Text>
          </View>
        )}

        <HourlyRainCard />
        <DamLevelList />
        <WeeklyWeatherList />
      </ScrollView>

      <RegionPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </SafeAreaView>
  );
}

function WeatherStat({
  icon,
  value,
  label,
  loading,
}: {
  icon: string;
  value: string;
  label: string;
  loading: boolean;
}) {
  const styles = useStyles();

  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      {loading ? (
        <View style={styles.statSkeleton}>
          <Skeleton width={44} height={18} />
        </View>
      ) : (
        <Text style={styles.statValue}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** 기온을 '23°'로. 값이 없으면 자리만 남긴다. */
function formatTemp(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : `${Math.round(value)}°`;
}

/**
 * 헤더에 쓰는 '언제 기준인지' 문구.
 *
 * 캐시를 먼저 보여주는 이상 이 표시가 없으면 오래된 값을 현재값처럼 읽게 된다.
 * 갱신 중인지, 실패해서 옛 값을 보고 있는지도 여기서 알린다.
 */
function describeFreshness({
  fetchedAt,
  loading,
  error,
}: {
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
}) {
  if (fetchedAt === null) return loading ? '불러오는 중…' : '아직 불러오지 못했어요';

  const at = new Date(fetchedAt);
  const time = at.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const date = at.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  const stamp = `${date} ${time} 기준`;

  if (loading) return `${stamp} · 갱신 중`;
  if (error) return `${stamp} · 갱신 실패`;
  return stamp;
}

const useStyles = createStyles((c) => ({
  locationPressed: {
    opacity: 0.7,
  },
  skeletonGap: {
    marginTop: 8,
  },
  statSkeleton: {
    marginVertical: 3,
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
