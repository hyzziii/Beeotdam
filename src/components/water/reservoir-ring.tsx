import { StyleSheet, Text, View } from 'react-native';
import { createStyles, useAppTheme } from '@/theme/theme-context';
import Svg, { Circle } from 'react-native-svg';


/** 저수율을 원형 게이지로 보여준다. 12시 방향에서 시계 방향으로 찬다. */
export function ReservoirRing({
  level,
  color,
  size = 62,
  stroke = 6,
}: {
  level: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const styles = useStyles();
  const theme = useAppTheme();

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(level, 0), 100);
  const center = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <Text style={[styles.label, { color }]}>{level.toFixed(1)}%</Text>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
}));
