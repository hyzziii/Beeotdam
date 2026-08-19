import { Pressable, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppSpacing } from '@/constants/app-theme';

export type ForecastMode = 'hourly' | 'weekly';

const OPTIONS: { key: ForecastMode; label: string }[] = [
  { key: 'hourly', label: '시간별' },
  { key: 'weekly', label: '주간 예보' },
];

/** 시간별 / 주간 예보를 오가는 세그먼트 컨트롤. */
export function ForecastToggle({
  value,
  onChange,
}: {
  value: ForecastMode;
  onChange: (next: ForecastMode) => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
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
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: c.segmentTrack,
    marginBottom: AppSpacing.cardGap,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentSelected: {
    backgroundColor: c.card,
  },
  label: {
    fontSize: 13,
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
