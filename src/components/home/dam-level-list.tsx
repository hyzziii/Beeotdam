import { StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing, pct } from '@/constants/home-theme';
import { Dam, damStatusConfig, dams } from '@/data';

/** Figma의 "한강 수계" 라벨에 맞춰 해당 수계의 댐만 노출한다. */
const HAN_RIVER_SYSTEM = ['소양강', '남한강'];

const localDams = dams.filter((dam) => HAN_RIVER_SYSTEM.includes(dam.river));

export function DamLevelList() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>내 지역 관련 댐</Text>
        <Text style={styles.sectionMeta}>한강 수계</Text>
      </View>

      {localDams.map((dam) => (
        <DamRow key={dam.id} dam={dam} />
      ))}
    </View>
  );
}

function DamRow({ dam }: { dam: Dam }) {
  const statusColor = damStatusConfig[dam.status].color;
  const delta = dam.level - dam.prevLevel;
  const rising = delta >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeGlyph}>💧</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{dam.name}</Text>
          <Text style={[styles.level, { color: statusColor }]}>{dam.level.toFixed(1)}%</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: pct(dam.level), backgroundColor: statusColor }]}
            />
          </View>

          <Text
            style={[styles.delta, { color: rising ? HomeColors.up : HomeColors.down }]}>
            {rising ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: HomeSpacing.cardGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: HomeSpacing.sectionHeaderGap,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: HomeColors.title,
  },
  sectionMeta: {
    fontSize: 11,
    color: HomeColors.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.card,
    borderWidth: 1,
    borderColor: HomeColors.cardBorder,
    marginBottom: 8,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: HomeRadius.badge,
    backgroundColor: HomeColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: HomeColors.title,
  },
  level: {
    fontSize: 17,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
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
  delta: {
    width: 50,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
  },
});
