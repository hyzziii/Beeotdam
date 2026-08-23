import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { HourlyRain } from '@/api/kma';
import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, RAIN_HIGHLIGHT, pct } from '@/constants/app-theme';

export function HourlyForecastList({
  hourly,
  currentHour,
}: {
  hourly: HourlyRain[] | null;
  /** '14시'. 목록이 오늘이 아니면 null이라 '현재' 배지가 붙지 않는다. */
  currentHour: string | null;
}) {
  const styles = useStyles();

  if (hourly === null) {
    return (
      <View style={styles.card}>
        {Array.from({ length: 6 }, (_, index) => (
          <View key={index} style={[styles.row, index < 5 && styles.rowDivider]}>
            <Skeleton width={38} height={14} />
            <View style={styles.middle}>
              <Skeleton width="70%" height={12} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {hourly.map((item, index) => {
        const isCurrent = item.hour === currentHour;
        const rainy = item.prob >= RAIN_HIGHLIGHT;
        const last = index === hourly.length - 1;

        return (
          <View
            key={item.hour}
            style={[styles.row, !last && styles.rowDivider, isCurrent && styles.rowCurrent]}>
            <Text style={[styles.hour, isCurrent && styles.hourCurrent]}>{item.hour}</Text>

            <Text style={styles.icon}>{item.icon}</Text>

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

const useStyles = createStyles((c) => ({
  card: {
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
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
    borderBottomColor: c.divider,
  },
  rowCurrent: {
    backgroundColor: c.accentSurface,
  },
  hour: {
    width: 34,
    fontSize: 11,
    color: c.faint,
  },
  hourCurrent: {
    fontWeight: '800',
    color: c.accentText,
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
    color: c.body,
  },
  probCurrent: {
    color: c.title,
  },
  track: {
    height: 5,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: c.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  fillRainy: {
    backgroundColor: c.accent,
  },
  fillDry: {
    backgroundColor: c.trackFilled,
  },
  amount: {
    width: 46,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: c.faint,
  },
  amountRainy: {
    color: c.accentText,
  },
  badgeSlot: {
    width: 32,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: c.track,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: c.body,
  },
}));
