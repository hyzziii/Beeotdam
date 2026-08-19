import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppRadius, AppSpacing } from '@/constants/app-theme';
import { MAX_REGIONS, regions } from '@/data';

export function RegionCard({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>관심 지역</Text>
      <Text style={styles.subtitle}>최대 {MAX_REGIONS}개까지 추가할 수 있어요</Text>

      <View style={styles.list}>
        {regions.map((region) => {
          const checked = selected.includes(region.id);
          // 한도에 찼으면 이미 담긴 항목만 눌러서 뺄 수 있다
          const blocked = !checked && selected.length >= MAX_REGIONS;

          return (
            <Pressable
              key={region.id}
              onPress={() => !blocked && onToggle(region.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: blocked }}
              style={({ pressed }) => [
                styles.row,
                checked && styles.rowChecked,
                blocked && styles.rowBlocked,
                pressed && !blocked && styles.pressed,
              ]}>
              <Text style={styles.pin}>📍</Text>
              <Text style={[styles.name, checked && styles.nameChecked]}>
                {region.district}, {region.city}
              </Text>

              <View style={[styles.circle, checked && styles.circleChecked]}>
                {checked && <Text style={styles.check}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    marginBottom: AppSpacing.cardGap,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.title,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: AppColors.muted,
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
  rowChecked: {
    backgroundColor: AppColors.accentSurface,
  },
  rowBlocked: {
    opacity: 0.45,
  },
  pin: {
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.body,
  },
  nameChecked: {
    fontWeight: '800',
    color: AppColors.accentText,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: AppColors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
  },
  check: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.7,
  },
});
