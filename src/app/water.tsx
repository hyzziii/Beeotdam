import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DamCard } from '@/components/water/dam-card';
import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { regionLabel } from '@/data';
import { useSettings } from '@/settings/settings-context';
import { createStyles } from '@/theme/theme-context';
import { useDams } from '@/water/dam-context';

/**
 * 보고 있는 지역과 연결된 댐의 저수 상황.
 *
 * 전국 목록이 아니라 지역 관련 댐만 보여준다. 그래서 상태 필터(전체·양호·주의)도 없다.
 * 상태 배지를 둘 근거가 없고(dam-card 주석 참고), 지역당 댐이 한두 곳이라 걸러낼 것도
 * 없기 때문이다.
 */
export default function WaterScreen() {
  const styles = useStyles();

  const { activeRegion } = useSettings();
  const { entries, loading, noRelation, noRelationMessage } = useDams();

  const fetchedAt = entries.find((entry) => entry.fetchedAt !== null)?.fetchedAt ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>수자원 현황</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {regionLabel(activeRegion)} 관련 댐 · K-water
            {fetchedAt !== null && ` · ${formatTime(fetchedAt)} 기준`}
          </Text>
          {!loading && fetchedAt !== null && <View style={styles.liveDot} />}
        </View>

        {noRelation ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{noRelationMessage}</Text>
          </View>
        ) : (
          entries.map((entry) => <DamCard key={entry.dam.id} entry={entry} />)
        )}

        {!noRelation && entries.length === 0 && (
          <Text style={styles.empty}>댐 정보를 불러오는 중이에요.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(stamp: number) {
  return new Date(stamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
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
  empty: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: c.muted,
  },
}));
