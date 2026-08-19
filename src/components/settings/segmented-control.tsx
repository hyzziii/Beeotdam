import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeColors } from '@/constants/home-theme';

/** 표시 설정에서 쓰는 작은 세그먼트 컨트롤. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
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

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    backgroundColor: '#EDF2F8',
    gap: 2,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentSelected: {
    backgroundColor: HomeColors.accent,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: HomeColors.muted,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.6,
  },
});
