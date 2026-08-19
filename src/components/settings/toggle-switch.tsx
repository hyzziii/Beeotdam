import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { HomeColors } from '@/constants/home-theme';

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 26;
const KNOB = 20;
const TRAVEL = TRACK_WIDTH - KNOB - 6;

/**
 * 디자인의 스위치는 iOS 형태(꽉 찬 알약 + 흰 손잡이)라 안드로이드 Material 스위치와
 * 모양이 다르다. 그래서 RN Switch 대신 직접 그린다.
 */
export function ToggleSwitch({
  value,
  onChange,
  color,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  color: string;
  accessibilityLabel?: string;
}) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [HomeColors.track, color],
  });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: 3,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#FFFFFF',
  },
});
