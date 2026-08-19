import { Text, View } from 'react-native';
import { ThemePreference, createStyles } from '@/theme/theme-context';

import { SegmentedControl } from './segmented-control';

import { AppRadius, AppSpacing } from '@/constants/app-theme';

export type TempUnit = 'c' | 'f';

const UNIT_OPTIONS: { key: TempUnit; label: string }[] = [
  { key: 'c', label: '°C' },
  { key: 'f', label: '°F' },
];

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: '☀️' },
  { key: 'dark', label: '🌙' },
  { key: 'auto', label: 'Auto' },
];

export function DisplayCard({
  unit,
  onUnitChange,
  theme,
  onThemeChange,
}: {
  unit: TempUnit;
  onUnitChange: (next: TempUnit) => void;
  theme: ThemePreference;
  onThemeChange: (next: ThemePreference) => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>표시 설정</Text>

      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.rowTitle}>온도 단위</Text>
          <Text style={styles.rowDescription}>섭씨/화씨 선택</Text>
        </View>
        <SegmentedControl options={UNIT_OPTIONS} value={unit} onChange={onUnitChange} />
      </View>

      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.rowTitle}>테마</Text>
          <Text style={styles.rowDescription}>화면 밝기 설정</Text>
        </View>
        <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  text: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.title,
  },
  rowDescription: {
    marginTop: 2,
    fontSize: 10,
    color: c.muted,
  },
}));
