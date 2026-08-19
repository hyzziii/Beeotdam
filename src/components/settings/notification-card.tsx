import { StyleSheet, Text, View } from 'react-native';

import { ToggleSwitch } from './toggle-switch';

import { HomeColors, HomeRadius, HomeSpacing } from '@/constants/home-theme';
import { notificationOptions } from '@/data';

export function NotificationCard({
  enabled,
  onToggle,
}: {
  enabled: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
}) {
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

const styles = StyleSheet.create({
  card: {
    padding: HomeSpacing.cardPad,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.card,
    borderWidth: 1,
    borderColor: HomeColors.cardBorder,
    marginBottom: HomeSpacing.cardGap,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: HomeColors.title,
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
    color: HomeColors.title,
  },
  rowDescription: {
    marginTop: 2,
    fontSize: 10,
    color: HomeColors.muted,
  },
});
