import { Pressable, Text, View } from 'react-native';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { MAX_REGIONS, findRegion } from '@/data';
import { useSettings } from '@/settings/settings-context';
import { createStyles } from '@/theme/theme-context';

/**
 * 담아둔 관심 지역만 보여준다.
 *
 * 전에는 전국 목록을 여기에 다 펼쳐 놨는데, 지역이 254개로 늘면서 설정 화면이 그만큼
 * 길어졌다. 고르는 일은 지역 선택 시트 한 곳에서만 하고, 이 카드는 담긴 것을 보여주고
 * 빼는 역할만 한다.
 */
export function RegionCard({ onAdd }: { onAdd: () => void }) {
  const styles = useStyles();

  const { selectedRegions, toggleRegion, activeRegion, regionsFull } = useSettings();

  // 저장된 코드가 목록에 없을 수 있다. 행정구역이 개편되면 예전 코드가 남는다.
  const saved = selectedRegions.map(findRegion).filter((region) => region !== undefined);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>관심 지역</Text>
      <Text style={styles.subtitle}>
        {saved.length}/{MAX_REGIONS}개 담았어요
      </Text>

      <View style={styles.list}>
        {saved.map((region) => {
          const viewing = region.code === activeRegion.code;

          return (
            <View key={region.code} style={[styles.row, viewing && styles.rowViewing]}>
              <Text style={styles.pin}>📍</Text>

              <Text style={[styles.name, viewing && styles.nameViewing]}>
                {region.district}, {region.sido}
              </Text>

              {viewing && <Text style={styles.badge}>보는 중</Text>}

              <Pressable
                onPress={() => toggleRegion(region.code)}
                accessibilityRole="button"
                accessibilityLabel={`${region.district} 관심 지역에서 빼기`}
                hitSlop={10}
                style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
                <Text style={styles.removeGlyph}>✕</Text>
              </Pressable>
            </View>
          );
        })}

        {saved.length === 0 && <Text style={styles.empty}>아직 담아둔 지역이 없어요.</Text>}
      </View>

      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
        <Text style={styles.addText}>+ 지역 추가</Text>
      </Pressable>

      {regionsFull && (
        <Text style={styles.note}>
          꽉 찼어요. 새로 담으려면 위에서 하나를 빼주세요.
        </Text>
      )}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  card: {
    padding: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    marginBottom: AppSpacing.cardGap,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: c.title,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: c.muted,
  },
  list: {
    marginTop: 10,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  rowViewing: {
    backgroundColor: c.accentSurface,
  },
  pin: {
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: c.body,
  },
  nameViewing: {
    fontWeight: '800',
    color: c.accentText,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: c.accentText,
  },
  remove: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeGlyph: {
    fontSize: 12,
    fontWeight: '700',
    color: c.muted,
  },
  empty: {
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 12,
    color: c.muted,
  },
  add: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.accentBorder,
    backgroundColor: c.accentSurface,
    alignItems: 'center',
  },
  addText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.accentText,
  },
  note: {
    marginTop: 8,
    fontSize: 10,
    color: c.muted,
  },
  pressed: {
    opacity: 0.7,
  },
}));
