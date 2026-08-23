import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DamFilterRow } from '@/components/water/dam-filter';
import { DamCard } from '@/components/water/dam-card';
import { AppSpacing } from '@/constants/app-theme';
import { dams } from '@/data';
import { DamFilter, filterDams } from '@/lib/dam';

/** 샘플 데이터라 갱신 시각도 고정값이다. 실제 API를 붙이면 응답 시각으로 교체한다. */
const LAST_UPDATED = '08.18 14:00';

export default function WaterScreen() {
  const styles = useStyles();

  const [filter, setFilter] = useState<DamFilter>('all');

  const visibleDams = useMemo(() => filterDams(dams, filter), [filter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>수자원 현황</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>K-water · 최종 업데이트 {LAST_UPDATED}</Text>
          <View style={styles.liveDot} />
        </View>

        <DamFilterRow value={filter} onChange={setFilter} />

        {visibleDams.map((dam) => (
          <DamCard key={dam.id} dam={dam} />
        ))}

        {visibleDams.length === 0 && (
          <Text style={styles.empty}>해당 조건에 맞는 댐이 없어요.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createStyles((c) => ({
  safeArea: {
    flex: 1,
    backgroundColor: c.screen,
  },
  container: {
    padding: AppSpacing.screenPad,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: c.title,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 14,
  },
  meta: {
    fontSize: 11,
    color: c.muted,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: c.muted,
  },
}));
