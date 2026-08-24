import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeeklyWeatherList } from '@/components/home/weekly-weather-list';
import { AirQualityCard } from '@/components/weather/air-quality-card';
import { ForecastMode, ForecastToggle } from '@/components/weather/forecast-toggle';
import { HourlyForecastList } from '@/components/weather/hourly-forecast-list';
import { WeatherError } from '@/components/weather/weather-error';
import { WeatherStatGrid } from '@/components/weather/weather-stat-grid';
import { AppSpacing } from '@/constants/app-theme';
import { findMidRegion, regionLabel } from '@/data';
import { useSettings } from '@/settings/settings-context';
import { useWeather } from '@/weather/weather-context';

export default function WeatherScreen() {
  const styles = useStyles();

  const { activeRegion } = useSettings();
  const { data, weekly, error, showError, dismissError, refresh } = useWeather();

  const [mode, setMode] = useState<ForecastMode>('hourly');

  const forecast = data?.forecast;
  // 목록이 오늘 것일 때만 '현재' 배지를 붙인다. 저녁에는 내일 예보를 보여준다.
  const currentHour = isToday(forecast?.hourlyDate ?? null)
    ? `${String(new Date().getHours()).padStart(2, '0')}시`
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>날씨 상세</Text>
        <Text style={styles.meta}>기상청 · {regionLabel(activeRegion)} 기준</Text>

        {showError && error ? (
          <WeatherError kind={error} onRetry={refresh} onShowCached={data ? dismissError : null} />
        ) : (
          <>
            <View style={styles.toggleWrap}>
              <ForecastToggle value={mode} onChange={setMode} />
            </View>

            {/* 주간 예보는 Home에 이미 있는 목록을 그대로 재사용한다 */}
            {mode === 'hourly' ? (
              <HourlyForecastList hourly={forecast?.hourly ?? null} currentHour={currentHour} />
            ) : (
              <WeeklyWeatherList
                days={weekly}
                midCity={findMidRegion(activeRegion.sido)?.taCity ?? null}
              />
            )}

            <AirQualityCard />
            <WeatherStatGrid />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** 'YYYYMMDD'가 오늘인지. */
function isToday(date: string | null) {
  if (date === null) return false;

  const now = new Date();
  const pad2 = (value: number) => String(value).padStart(2, '0');
  return date === `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
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
  toggleWrap: {
    marginTop: 14,
  },
}));
