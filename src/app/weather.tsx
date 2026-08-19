import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeeklyWeatherList } from '@/components/home/weekly-weather-list';
import { AirQualityCard } from '@/components/weather/air-quality-card';
import { ForecastMode, ForecastToggle } from '@/components/weather/forecast-toggle';
import { HourlyForecastList } from '@/components/weather/hourly-forecast-list';
import { WeatherStatGrid } from '@/components/weather/weather-stat-grid';
import { HomeColors, HomeSpacing } from '@/constants/home-theme';

export default function WeatherScreen() {
  const [mode, setMode] = useState<ForecastMode>('hourly');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>날씨 상세</Text>
        <Text style={styles.meta}>기상청 · 강남구, 서울 기준</Text>

        <View style={styles.toggleWrap}>
          <ForecastToggle value={mode} onChange={setMode} />
        </View>

        {/* 주간 예보는 Home에 이미 있는 목록을 그대로 재사용한다 */}
        {mode === 'hourly' ? <HourlyForecastList /> : <WeeklyWeatherList />}

        <AirQualityCard />
        <WeatherStatGrid />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HomeColors.screen,
  },
  container: {
    padding: HomeSpacing.screenPad,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: HomeColors.title,
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: HomeColors.muted,
  },
  toggleWrap: {
    marginTop: 14,
  },
});
