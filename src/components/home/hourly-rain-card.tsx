import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing, RAIN_HIGHLIGHT } from '@/constants/home-theme';
import { hourlyRain } from '@/data';

const BAR_MAX_HEIGHT = 64;
const BAR_MIN_HEIGHT = 6;

const maxAmount = Math.max(...hourlyRain.map((item) => item.amount));

export function HourlyRainCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>시간대별 강수</Text>
          <Text style={styles.subtitle}>오늘 오전 6시 ~ 오후 8시</Text>
        </View>

        <View style={styles.legend}>
          <LegendItem color={HomeColors.accent} label="강수확률" />
          <LegendItem color={HomeColors.accentLegend} label="강수량" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chart}>
        {hourlyRain.map((item) => {
          const active = item.prob >= RAIN_HIGHLIGHT;
          const height =
            BAR_MIN_HEIGHT + (item.amount / maxAmount) * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);

          return (
            <View key={item.hour} style={styles.column}>
              <Text style={[styles.prob, active && styles.probActive]}>{item.prob}%</Text>

              <View style={styles.barSlot}>
                <View
                  style={[
                    styles.bar,
                    { height },
                    active ? styles.barActive : styles.barInactive,
                  ]}
                />
              </View>

              {/* Figma: 강수량 0인 시간대는 mm 라벨 없이 시각만 위로 올라온다 */}
              {item.amount > 0 && (
                <Text style={[styles.amount, active && styles.amountActive]}>{item.amount}㎜</Text>
              )}

              <Text style={[styles.hour, active && styles.hourActive]}>{item.hour}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: HomeColors.title,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: HomeColors.accentText,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 9,
    color: HomeColors.muted,
  },
  chart: {
    // 위 기준 정렬이라 강수확률 줄이 가지런히 맞고, mm 라벨이 없는 컬럼(강수량 0)은
    // 시각 라벨이 위로 올라온다 — Figma의 어긋난 베이스라인이 이 방향이다.
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingRight: 4,
  },
  column: {
    width: 42,
    alignItems: 'center',
  },
  prob: {
    fontSize: 10,
    fontWeight: '600',
    color: HomeColors.faint,
  },
  probActive: {
    fontWeight: '800',
    color: HomeColors.accentText,
  },
  barSlot: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  bar: {
    width: 20,
    borderRadius: HomeRadius.bar,
  },
  barActive: {
    backgroundColor: HomeColors.accent,
  },
  barInactive: {
    backgroundColor: HomeColors.track,
  },
  amount: {
    marginTop: 7,
    fontSize: 9,
    color: HomeColors.faint,
  },
  amountActive: {
    fontWeight: '700',
    color: HomeColors.accentText,
  },
  hour: {
    marginTop: 4,
    fontSize: 10,
    color: HomeColors.faint,
  },
  hourActive: {
    color: HomeColors.accentText,
  },
});
