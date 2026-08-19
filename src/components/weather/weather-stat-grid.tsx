import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { weatherStats } from '@/data';

/** 풍속·습도·기압·가시거리·일출·일몰을 2열 타일로 보여준다. */
export function WeatherStatGrid() {
  const styles = useStyles();

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

const useStyles = createStyles((c) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: AppSpacing.cardGap,
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
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
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
    color: c.title,
  },
  label: {
    marginTop: 2,
    fontSize: 9,
    color: c.muted,
  },
}));
