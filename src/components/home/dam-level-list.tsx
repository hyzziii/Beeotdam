import { Text, View } from 'react-native';

import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, pct } from '@/constants/app-theme';
import { regionLabel } from '@/data';
import { useSettings } from '@/settings/settings-context';
import { createStyles, useAppTheme } from '@/theme/theme-context';
import { DamEntry, useDams } from '@/water/dam-context';
import { failureMessage } from '@/weather/failure-message';

/**
 * 보고 있는 지역과 연결된 댐의 저수율.
 *
 * 댐마다 자기 저수율을 따로 보여준다. 여러 댐이 걸린 지역이라도 평균이나 합계를 내지
 * 않는다. '이 지역 물은 이 댐에서 온다'가 아니라 '이 지역에 물을 대는 댐들'이다.
 */
export function DamLevelList() {
  const styles = useStyles();

  const { activeRegion } = useSettings();
  const { entries, loading, noRelation, noRelationMessage } = useDams();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>내 지역 관련 댐</Text>
        <Text style={styles.sectionMeta}>{regionLabel(activeRegion)}</Text>
      </View>

      {noRelation ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{noRelationMessage}</Text>
        </View>
      ) : entries.length === 0 && loading ? (
        <View style={styles.card}>
          <Skeleton width={34} height={34} radius={10} />
          <View style={styles.content}>
            <Skeleton width="55%" height={14} />
            <View style={styles.skeletonGap}>
              <Skeleton width="100%" height={8} radius={4} />
            </View>
          </View>
        </View>
      ) : (
        entries.map((entry) => <DamRow key={entry.dam.id} entry={entry} />)
      )}
    </View>
  );
}

function DamRow({ entry }: { entry: DamEntry }) {
  const styles = useStyles();
  const theme = useAppTheme();

  const { dam, relation, snapshot, error } = entry;

  const level = snapshot?.current.level ?? null;
  const previous = snapshot?.previousLevel ?? null;
  const delta = level !== null && previous !== null ? level - previous : null;

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeGlyph}>💧</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{dam.name}</Text>
          {/* 근거가 있는 관계라는 표시. 공식 문구에 지역 이름이 나오면 '주요 수원'이다. */}
          <Text style={styles.relation}>{relation}</Text>

          <View style={styles.spacer} />

          {level === null ? (
            <Text style={styles.unavailable}>{error ? failureMessage(error) : '—'}</Text>
          ) : (
            <Text style={styles.level}>{level.toFixed(1)}%</Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.track}>
            {level !== null && <View style={[styles.fill, { width: pct(level) }]} />}
          </View>

          {delta !== null && (
            <Text style={[styles.delta, { color: delta >= 0 ? theme.up : theme.down }]}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  section: {
    marginBottom: AppSpacing.cardGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: AppSpacing.sectionHeaderGap,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  sectionMeta: {
    fontSize: 11,
    color: c.muted,
  },
  notice: {
    padding: 14,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: c.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    marginBottom: 8,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: c.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  skeletonGap: {
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spacer: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: c.title,
  },
  relation: {
    fontSize: 10,
    fontWeight: '700',
    color: c.accentText,
  },
  level: {
    fontSize: 14,
    fontWeight: '800',
    color: c.accentText,
  },
  unavailable: {
    fontSize: 10,
    color: c.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: c.accent,
  },
  delta: {
    fontSize: 11,
    fontWeight: '700',
  },
}));
