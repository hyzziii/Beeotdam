import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppRadius, AppSpacing, RAIN_HIGHLIGHT, pct } from '@/constants/app-theme';
import { currentHour, hourlyRain } from '@/data';

/** hourlyRain에는 아이콘 필드가 없어서 강수확률로 대신 고른다. */
function hourIcon(prob: number) {
  if (prob >= 70) return '🌧';
  if (prob >= 40) return '🌦';
  return '⛅';
}

export function HourlyForecastList() {
  return (
    <View style={styles.card}>
      {hourlyRain.map((item, index) => {
        const isCurrent = item.hour === currentHour;
        const rainy = item.prob >= RAIN_HIGHLIGHT;
        const last = index === hourlyRain.length - 1;

        return (
          <View
            key={item.hour}
            style={[styles.row, !last && styles.rowDivider, isCurrent && styles.rowCurrent]}>
            <Text style={[styles.hour, isCurrent && styles.hourCurrent]}>{item.hour}</Text>

            <Text style={styles.icon}>{hourIcon(item.prob)}</Text>

            <View style={styles.middle}>
              <Text style={[styles.prob, isCurrent && styles.probCurrent]}>
                강수확률 {item.prob}%
              </Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: pct(item.prob) },
                    rainy ? styles.fillRainy : styles.fillDry,
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.amount, rainy && styles.amountRainy]}>
              {/* 2.0은 그냥 찍으면 "2"가 되어 다른 행의 소수 1자리와 어긋난다 */}
              {item.amount > 0 ? `${item.amount.toFixed(1)}㎜` : ''}
            </Text>

            <View style={styles.badgeSlot}>
              {isCurrent && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>현재</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: AppRadius.card,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    overflow: 'hidden',
    marginBottom: AppSpacing.cardGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 8,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowCurrent: {
    backgroundColor: AppColors.accentSurface,
  },
  hour: {
    width: 34,
    fontSize: 11,
    color: AppColors.faint,
  },
  hourCurrent: {
    fontWeight: '800',
    color: AppColors.accentText,
  },
  icon: {
    width: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  middle: {
    flex: 1,
  },
  prob: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.body,
  },
  probCurrent: {
    color: AppColors.title,
  },
  track: {
    height: 5,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: AppColors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  fillRainy: {
    backgroundColor: AppColors.accent,
  },
  fillDry: {
    backgroundColor: '#CBD5E1',
  },
  amount: {
    width: 46,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.faint,
  },
  amountRainy: {
    color: AppColors.accentText,
  },
  badgeSlot: {
    width: 32,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: AppColors.track,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: AppColors.body,
  },
});
