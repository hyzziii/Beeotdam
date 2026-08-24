import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, RAIN_HIGHLIGHT } from '@/constants/app-theme';
import { WeeklyDay } from '@/weather/weather-context';

/**
 * 주간 날씨.
 *
 * 앞부분은 단기예보, 4일 후부터는 중기예보다. 중기예보의 기온은 시/도 대표 도시 기준이라
 * 그 구간이 있으면 아래에 밝힌다.
 */
export function WeeklyWeatherList({
  days,
  midCity,
}: {
  days: WeeklyDay[];
  /** 중기예보 기온이 어느 도시 기준인지. */
  midCity: string | null;
}) {
  const styles = useStyles();

  if (days.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>주간 날씨</Text>
        <View style={styles.list}>
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={styles.row}>
              <Skeleton width={20} height={13} />
              <Skeleton width="60%" height={8} radius={4} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  /*
   * 기온 막대는 주간 최저~최고 범위를 축으로 삼는다. 기온을 못 받은 날이 있어 값이
   * 있는 날만 모아 범위를 낸다.
   */
  const lows = days.map((day) => day.low).filter((value) => value !== null);
  const highs = days.map((day) => day.high).filter((value) => value !== null);
  const weekMin = lows.length ? Math.min(...lows) : 0;
  const weekMax = highs.length ? Math.max(...highs) : 1;

  const hasMid = days.some((day) => day.fromMid);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>주간 날씨</Text>

      <View style={styles.list}>
        {days.map((day) => {
          const rainy = day.rain >= RAIN_HIGHLIGHT;

          return (
            <View key={day.date} style={styles.row}>
              <Text style={styles.day}>{day.short}</Text>
              <Text style={styles.icon}>{day.icon}</Text>

              {/* 주간 최저~최고 범위 안에서 그날의 기온 구간을 표시한다 */}
              <View style={styles.track}>
                {day.low !== null && day.high !== null && (
                  <>
                    <View style={{ flexGrow: day.low - weekMin }} />
                    <View style={[styles.fill, { flexGrow: Math.max(day.high - day.low, 0.5) }]} />
                    <View style={{ flexGrow: weekMax - day.high }} />
                  </>
                )}
              </View>

              <Text style={styles.low}>{day.low === null ? '—' : `${day.low}°`}</Text>
              <Text style={styles.high}>{day.high === null ? '—' : `${day.high}°`}</Text>
              <Text style={[styles.rain, rainy && styles.rainActive]}>{day.rain}%</Text>
            </View>
          );
        })}
      </View>

      {hasMid && midCity && (
        <Text style={styles.note}>4일 후부터는 중기예보 · 기온은 {midCity} 기준</Text>
      )}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  note: {
    marginTop: 10,
    fontSize: 10,
    color: c.muted,
  },
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
