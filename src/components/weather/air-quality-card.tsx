import { StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing, pct } from '@/constants/home-theme';
import { airGradeConfig, airQuality } from '@/data';

export function AirQualityCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>대기 환경</Text>

      {airQuality.map((metric) => {
        const grade = airGradeConfig[metric.grade];

        return (
          <View key={metric.label} style={styles.row}>
            <Text style={styles.label}>{metric.label}</Text>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: pct(Math.round(metric.ratio * 100)), backgroundColor: grade.color },
                ]}
              />
            </View>

            <Text style={styles.reading}>{metric.reading}</Text>

            <View style={[styles.badge, { backgroundColor: grade.bg }]}>
              <Text style={[styles.badgeText, { color: grade.color }]}>({metric.grade})</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: HomeSpacing.cardPad,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.card,
    borderWidth: 1,
    borderColor: HomeColors.cardBorder,
    marginBottom: HomeSpacing.cardGap,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: HomeColors.title,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  label: {
    width: 62,
    fontSize: 11,
    color: HomeColors.body,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: HomeColors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  reading: {
    fontSize: 11,
    fontWeight: '800',
    color: HomeColors.title,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
