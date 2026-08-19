import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppSpacing } from '@/constants/app-theme';

const RADIUS = 20;

export function WaterSummaryCard({
  averageLevel,
  safeCount,
  cautionCount,
}: {
  averageLevel: number;
  safeCount: number;
  cautionCount: number;
}) {
  return (
    <View style={styles.card}>
      {/* expo-linear-gradient가 없어서 svg로 배경 그라디언트를 깐다 */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="waterSummary" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3FAAF3" />
            <Stop offset="1" stopColor="#1A72C9" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={RADIUS} fill="url(#waterSummary)" />
      </Svg>

      <View style={styles.row}>
        <SummaryItem icon="💧" value={`${averageLevel.toFixed(1)}%`} label="전국 평균 저수율" />
        <SummaryItem icon="✅" value={`${safeCount}개`} label="양호 댐" />
        <SummaryItem icon="⚠️" value={`${cautionCount}개`} label="주의 이상" />
      </View>
    </View>
  );
}

function SummaryItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: AppSpacing.cardGap,
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  value: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    marginTop: 3,
    fontSize: 10,
    color: '#DCEEFF',
  },
});
