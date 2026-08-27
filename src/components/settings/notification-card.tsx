import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { ToggleSwitch } from './toggle-switch';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { notificationOptions } from '@/data';

/**
 * 알림 설정.
 *
 * 아직 알림을 보내지 않는다. 지금은 켜고 끈 상태를 기기에 저장할 뿐이고, 그 값을 읽어
 * 알림을 예약하는 코드가 없다.
 *
 * 그래서 스위치를 누를 수 없게 막고 '준비 중'을 붙였다. 눌리는 스위치는 뭔가 됐다는 뜻이
 * 되어 버린다. 켤 수 있는데 아무 일도 안 일어나는 것보다, 아직 안 된다고 말하는 게 낫다.
 *
 * 다섯 항목이 필요한 것도 다르다. 강수·집중호우는 예보를 미리 읽어 로컬 알림을 걸면 되지만,
 * 저수율·홍수·가뭄은 앱이 꺼져 있을 때도 값을 지켜볼 무언가가 있어야 한다. 특히 홍수·방류의
 * '즉시'는 서버에서 밀어 주지 않으면 지킬 수 없는 약속이다.
 */
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
      <View style={styles.header}>
        <Text style={styles.title}>알림 설정</Text>
        <View style={styles.pending}>
          <Text style={styles.pendingText}>준비 중</Text>
        </View>
      </View>

      <Text style={styles.notice}>
        아직 알림을 보내지 않아요. 어떤 알림을 담을지만 정해 둔 상태입니다.
      </Text>

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
              disabled
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: c.title,
  },
  pending: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: c.segmentTrack,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: c.muted,
  },
  notice: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 15,
    color: c.muted,
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
