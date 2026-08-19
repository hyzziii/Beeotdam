import { Pressable, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppSpacing } from '@/constants/app-theme';
import { DamFilter } from '@/lib/dam';

const OPTIONS: { key: DamFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'safe', label: '양호' },
  { key: 'caution', label: '주의' },
];

export function DamFilterRow({
  value,
  onChange,
}: {
  value: DamFilter;
  onChange: (next: DamFilter) => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            hitSlop={4}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: AppSpacing.cardGap,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.cardBorder,
    backgroundColor: c.card,
  },
  chipSelected: {
    borderColor: c.accent,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: c.muted,
  },
  labelSelected: {
    fontWeight: '800',
    color: c.accentText,
  },
  pressed: {
    opacity: 0.6,
  },
}));
