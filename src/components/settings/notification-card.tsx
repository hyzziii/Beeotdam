import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { ToggleSwitch } from './toggle-switch';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { notificationOptions } from '@/data';

export function NotificationCard({
  enabled,
  onToggle,
}: {
  enabled: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>알림 설정</Text>

      <View style={styles.list}>
        {notificationOptions.map((option) => (
          <View key={option.id} style={styles.row}>
            <View style={[styles.badge, { backgroundColor: option.tint }]}>
              <Text style={styles.icon}>{option.icon}</Text>
            </View>

            <View style={styles.text}>
              <Text style={styles.rowTitle}>{option.title}</Text>
              <Text style={styles.rowDescription}>{option.description}</Text>
            </View>

            <ToggleSwitch
              value={enabled[option.id]}
              onChange={(next) => onToggle(option.id, next)}
              color={option.color}
              accessibilityLabel={option.title}
            />
          </View>
        ))}
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
  list: {
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 17,
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
