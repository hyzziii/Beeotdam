import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ReservoirRing } from './reservoir-ring';

import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, pct } from '@/constants/app-theme';
import { FLOOD_LIMIT_PERCENT } from '@/lib/dam';
import { createStyles, useAppTheme } from '@/theme/theme-context';
import { DamEntry } from '@/water/dam-context';
import { failureMessage } from '@/weather/failure-message';

const KIND_LABEL = {
  multipurpose: '다목적댐',
  watersupply: '용수전용댐',
} as const;

/**
 * 댐 한 곳의 현재 저수율과 최근 흐름.
 *
 * 상태 배지(양호·주의 등)는 두지 않는다. 저수율만으로 가뭄 단계를 정할 수 없기 때문이다.
 * 국가 가뭄 예·경보 기준의 숫자(평년 저수율의 70/60/50/40%)는 농업용 저수지 기준이고
 * 평년 저수율이 있어야 쓸 수 있는데 수문 운영 정보 API는 현재값만 준다. K-water 댐이
 * 속한 생활·공업용수 기준은 아예 정성적 판단이다. 그래서 받은 값만 보여준다.
 */
export function DamCard({ entry }: { entry: DamEntry }) {
  const styles = useStyles();
  const theme = useAppTheme();

  const [showTrend, setShowTrend] = useState(false);

  const { dam, relation, snapshot, error } = entry;

  const current = snapshot?.current ?? null;
  const previous = snapshot?.previousLevel ?? null;
  const delta = current && previous !== null ? current.level - previous : null;

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{dam.name}</Text>
            <Text style={styles.relation}>{relation}</Text>
          </View>

          <Text style={styles.location}>
            {dam.river} · {KIND_LABEL[dam.kind]}
          </Text>

          {current === null ? (
            <Text style={styles.unavailable}>
              {error ? failureMessage(error) : '불러오는 중…'}
            </Text>
          ) : (
            <>
              <View style={styles.track}>
                <View style={[styles.fill, { width: pct(current.level) }]} />
                {/* 저수율이 제한선을 넘으면 눈금이 채워진 막대 위에 놓여 같은 색끼리 묻힌다 */}
                <View
                  style={[
                    styles.floodMark,
                    {
                      left: pct(FLOOD_LIMIT_PERCENT),
                      backgroundColor: current.level >= FLOOD_LIMIT_PERCENT ? '#FFFFFF' : '#EF4444',
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
                  {/* API가 초당 유량으로 준다. 하루 총량으로 환산하면 지금 유량이 하루
                      내내 유지된다는 가정이 들어가므로 받은 단위 그대로 쓴다. */}
                  <Text style={styles.flowValue}>{current.inflow.toFixed(1)}㎥/s</Text>
                </Text>
                <Text style={styles.flowText}>
                  <Text style={styles.flowArrowOut}>↑ </Text>
                  <Text style={styles.flowLabel}>방류 </Text>
                  <Text style={styles.flowValue}>{current.outflow.toFixed(1)}㎥/s</Text>
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.right}>
          {current === null ? (
            <Skeleton width={62} height={62} radius={31} />
          ) : (
            <ReservoirRing level={current.level} color={theme.accent} />
          )}

          {delta !== null && (
            <>
              <Text style={[styles.delta, { color: delta >= 0 ? theme.up : theme.down }]}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%p
              </Text>
              <Text style={styles.deltaCaption}>전일 대비</Text>
            </>
          )}
        </View>
      </View>

      {snapshot && snapshot.daily.length > 0 && (
        <>
          <Pressable
            onPress={() => setShowTrend((prev) => !prev)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showTrend }}
            style={({ pressed }) => [styles.notice, pressed && styles.pressed]}>
            <Text style={styles.noticeText}>
              {showTrend
                ? '최근 7일 그래프 접기 ↑'
                : '탭하여 최근 7일 강수량·저수율 그래프 보기 →'}
            </Text>
          </Pressable>

          {showTrend && <WeeklyTrend entry={entry} color={theme.accent} />}
        </>
      )}
    </View>
  );
}

/** 최근 7일 강수량(막대)과 저수율(수치)을 한눈에 보여준다. */
function WeeklyTrend({ entry, color }: { entry: DamEntry; color: string }) {
  const styles = useStyles();

  const daily = entry.snapshot?.daily ?? [];
  const maxRain = Math.max(...daily.map((reading) => reading.rainfall), 1);

  return (
    <View style={styles.trend}>
      <View style={styles.trendLegend}>
        <Text style={styles.trendLegendText}>강수량 ㎜</Text>
        <Text style={styles.trendLegendText}>저수율 %</Text>
      </View>

      <View style={styles.trendRow}>
        {daily.map((reading) => (
          <View key={reading.day} style={styles.trendColumn}>
            <Text style={styles.trendRain}>{reading.rainfall}</Text>

            <View style={styles.trendBarSlot}>
              <View
                style={[styles.trendBar, { height: Math.max((reading.rainfall / maxRain) * 34, 3) }]}
              />
            </View>

            <Text style={[styles.trendLevel, { color }]}>{reading.level.toFixed(1)}</Text>
            <Text style={styles.trendDay}>{reading.day}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  relation: {
    fontSize: 10,
    fontWeight: '700',
    color: c.accentText,
  },
  location: {
    marginTop: 3,
    fontSize: 11,
    color: c.muted,
  },
  unavailable: {
    marginTop: 12,
    fontSize: 12,
    color: c.muted,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: c.track,
    marginTop: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: c.accent,
  },
  floodMark: {
    position: 'absolute',
    width: 2,
    height: 8,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: c.down,
    fontWeight: '800',
  },
  flowLabel: {
    color: c.muted,
  },
  flowValue: {
    fontWeight: '700',
    color: c.body,
  },
  right: {
    width: 74,
    alignItems: 'center',
  },
  delta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  deltaCaption: {
    fontSize: 9,
    color: c.muted,
  },
  notice: {
    marginTop: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: c.accentSurface,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: c.accentText,
  },
  pressed: {
    opacity: 0.7,
  },
  trend: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.divider,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendLegendText: {
    fontSize: 9,
    color: c.muted,
  },
  trendRow: {
    flexDirection: 'row',
    marginTop: 8,
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
    width: 8,
    borderRadius: AppRadius.bar,
    backgroundColor: c.accentLegend,
  },
  trendLevel: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '700',
  },
  trendDay: {
    marginTop: 2,
    fontSize: 9,
    color: c.faint,
  },
}));
