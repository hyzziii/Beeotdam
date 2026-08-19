import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, useAppTheme } from '@/theme/theme-context';

import { ReservoirRing } from './reservoir-ring';

import { AppRadius, AppSpacing, pct } from '@/constants/app-theme';
import { Dam, damStatusConfig } from '@/data';
import { FLOOD_LIMIT_PERCENT, damDelta, isSafe, withThousands } from '@/lib/dam';

export function DamCard({ dam }: { dam: Dam }) {
  const styles = useStyles();
  const theme = useAppTheme();

  const [showTrend, setShowTrend] = useState(false);

  const status = damStatusConfig[dam.status];
  const delta = damDelta(dam);
  const rising = delta >= 0;
  const safe = isSafe(dam);

  return (
    <View
      style={[
        styles.card,
        !safe && { backgroundColor: status.bg, borderColor: status.border },
      ]}>
      <View style={styles.main}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{dam.name}</Text>
            <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.location}>
            {dam.region} · {dam.river}
          </Text>

          <View style={styles.track}>
            <View
              style={[styles.fill, { width: pct(dam.level), backgroundColor: status.color }]}
            />
            {/* 저수율이 제한선을 넘으면 눈금이 채워진 막대 위에 놓여 같은 빨강끼리 묻힌다 */}
            <View
              style={[
                styles.floodMark,
                {
                  left: pct(FLOOD_LIMIT_PERCENT),
                  backgroundColor: dam.level >= FLOOD_LIMIT_PERCENT ? '#FFFFFF' : '#EF4444',
                },
              ]}
            />
          </View>

          <View style={styles.scaleRow}>
            <Text style={styles.scaleEdge}>0%</Text>
            <Text style={styles.floodLabel}>▲ 홍수 제한 {FLOOD_LIMIT_PERCENT}%</Text>
            <Text style={styles.scaleEdge}>100%</Text>
          </View>

          <View style={styles.flowRow}>
            <Text style={styles.flowText}>
              <Text style={styles.flowArrowIn}>↓ </Text>
              <Text style={styles.flowLabel}>유입 </Text>
              <Text style={styles.flowValue}>{withThousands(dam.inflow)}만㎥</Text>
            </Text>
            <Text style={styles.flowText}>
              <Text style={styles.flowArrowOut}>↑ </Text>
              <Text style={styles.flowLabel}>방류 </Text>
              <Text style={styles.flowValue}>{withThousands(dam.outflow)}만㎥</Text>
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <ReservoirRing level={dam.level} color={status.color} />
          <Text style={[styles.delta, { color: rising ? theme.up : theme.down }]}>
            {rising ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%p
          </Text>
          <Text style={styles.deltaCaption}>전일 대비</Text>
        </View>
      </View>

      <Pressable
        onPress={() => setShowTrend((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showTrend }}
        style={({ pressed }) => [styles.notice, pressed && styles.pressed]}>
        <Text style={styles.noticeText}>
          {showTrend ? '최근 7일 그래프 접기 ↑' : '탭하여 최근 7일 강수량·저수율 그래프 보기 →'}
        </Text>
      </Pressable>

      {showTrend && <WeeklyTrend dam={dam} color={status.color} />}
    </View>
  );
}

/** 최근 7일 강수량(막대)과 저수율(수치)을 한눈에 보여준다. */
function WeeklyTrend({ dam, color }: { dam: Dam; color: string }) {
  const styles = useStyles();

  const maxRain = Math.max(...dam.weeklyData.map((entry) => entry.rain), 1);

  return (
    <View style={styles.trend}>
      <View style={styles.trendLegend}>
        <Text style={styles.trendLegendText}>강수량 ㎜</Text>
        <Text style={styles.trendLegendText}>저수율 %</Text>
      </View>

      <View style={styles.trendRow}>
        {dam.weeklyData.map((entry) => (
          <View key={entry.day} style={styles.trendColumn}>
            <Text style={styles.trendRain}>{entry.rain}</Text>

            <View style={styles.trendBarSlot}>
              <View
                style={[
                  styles.trendBar,
                  { height: Math.max((entry.rain / maxRain) * 34, 3) },
                ]}
              />
            </View>

            <Text style={[styles.trendLevel, { color }]}>{entry.level.toFixed(1)}</Text>
            <Text style={styles.trendDay}>{entry.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  card: {
    padding: 14,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    marginBottom: AppSpacing.cardGap,
  },
  main: {
    flexDirection: 'row',
    gap: 12,
  },
  left: {
    flex: 1,
  },
  right: {
    width: 68,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: c.title,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  location: {
    marginTop: 4,
    fontSize: 11,
    color: c.muted,
  },
  track: {
    height: 8,
    marginTop: 12,
    borderRadius: 4,
    backgroundColor: c.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  floodMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  scaleEdge: {
    fontSize: 9,
    color: c.faint,
  },
  floodLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  flowRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  flowText: {
    fontSize: 11,
  },
  flowArrowIn: {
    color: c.accent,
    fontWeight: '800',
  },
  flowArrowOut: {
    color: c.accentText,
    fontWeight: '800',
  },
  flowLabel: {
    color: c.muted,
  },
  flowValue: {
    fontWeight: '800',
    color: c.title,
  },
  delta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  deltaCaption: {
    marginTop: 1,
    fontSize: 9,
    color: c.faint,
  },
  notice: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: c.accentSurface,
  },
  noticeText: {
    fontSize: 11,
    color: c.body,
  },
  pressed: {
    opacity: 0.6,
  },
  trend: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.cardBorder,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendLegendText: {
    fontSize: 9,
    color: c.faint,
  },
  trendRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
  },
  trendRain: {
    fontSize: 9,
    color: c.muted,
  },
  trendBarSlot: {
    height: 34,
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  trendBar: {
    width: 12,
    borderRadius: 3,
    backgroundColor: c.accent,
  },
  trendLevel: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '800',
  },
  trendDay: {
    marginTop: 2,
    fontSize: 8,
    color: c.faint,
  },
}));
