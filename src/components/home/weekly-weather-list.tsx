import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppRadius, AppSpacing, RAIN_HIGHLIGHT } from '@/constants/app-theme';
import { weeklyWeather } from '@/data';

const weekMin = Math.min(...weeklyWeather.map((day) => day.low));
const weekMax = Math.max(...weeklyWeather.map((day) => day.high));

export function WeeklyWeatherList() {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>주간 날씨</Text>

      <View style={styles.list}>
        {weeklyWeather.map((day) => {
          const rainy = day.rain >= RAIN_HIGHLIGHT;

          return (
            <View key={day.day} style={styles.row}>
              <Text style={styles.day}>{day.short}</Text>
              <Text style={styles.icon}>{day.icon}</Text>

              {/* 주간 최저~최고 범위 안에서 그날의 기온 구간을 표시한다 */}
              <View style={styles.track}>
                <View style={{ flexGrow: day.low - weekMin }} />
                <View style={[styles.fill, { flexGrow: Math.max(day.high - day.low, 0.5) }]} />
                <View style={{ flexGrow: weekMax - day.high }} />
              </View>

              <Text style={styles.low}>{day.low}°</Text>
              <Text style={styles.high}>{day.high}°</Text>
              <Text style={[styles.rain, rainy && styles.rainActive]}>{day.rain}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  card: {
    padding: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    marginBottom: AppSpacing.cardGap,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  list: {
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
  },
  day: {
    width: 22,
    fontSize: 12,
    color: c.body,
  },
  icon: {
    width: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 6,
    marginHorizontal: 2,
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: c.accent,
  },
  low: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
    color: c.muted,
  },
  high: {
    width: 30,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: c.title,
  },
  rain: {
    width: 34,
    textAlign: 'right',
    fontSize: 11,
    color: c.muted,
  },
  rainActive: {
    color: c.accentText,
  },
}));
