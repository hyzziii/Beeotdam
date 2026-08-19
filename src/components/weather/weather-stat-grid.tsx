import { StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing } from '@/constants/home-theme';
import { weatherStats } from '@/data';

/** 풍속·습도·기압·가시거리·일출·일몰을 2열 타일로 보여준다. */
export function WeatherStatGrid() {
  return (
    <View style={styles.grid}>
      {weatherStats.map((stat) => (
        <View key={stat.label} style={styles.tile}>
          <Text style={styles.icon}>{stat.icon}</Text>
          <View style={styles.text}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: HomeSpacing.cardGap,
  },
  tile: {
    // 두 열로 나누되 gap 8을 빼야 3열로 넘어가지 않는다
    width: '48.5%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.card,
    borderWidth: 1,
    borderColor: HomeColors.cardBorder,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: HomeColors.title,
  },
  label: {
    marginTop: 2,
    fontSize: 9,
    color: HomeColors.muted,
  },
});
