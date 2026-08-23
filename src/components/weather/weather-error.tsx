import { Pressable, Text, View } from 'react-native';

import { ApiFailureKind } from '@/api/http';
import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { createStyles } from '@/theme/theme-context';
import { FailureTone, failureCopy } from '@/weather/failure-message';

/**
 * 색조별 색. 팔레트에 위험색이 없어 여기서 정한다 — 댐 상태 배지가 색을 직접 들고 있는
 * 것과 같은 방식이다. 라이트/다크 양쪽에서 읽히는 값으로 골랐다.
 */
const TONES: Record<FailureTone, { accent: string; text: string; surface: string }> = {
  alarm: { accent: '#EF4444', text: '#DC2626', surface: '#FDECEC' },
  calm: { accent: '#3B9EFF', text: '#2D8FE8', surface: '#EAF4FF' },
};

/**
 * 날씨를 불러오지 못했을 때 대신 보여주는 화면.
 *
 * 종류에 따라 사용자가 할 수 있는 일이 달라 문구와 색이 바뀐다. 캐시가 있으면 '이전에
 * 불러온 데이터 보기'로 넘어갈 수 있고, 없으면 그 버튼은 나오지 않는다.
 */
export function WeatherError({
  kind,
  onRetry,
  onShowCached,
}: {
  kind: ApiFailureKind;
  onRetry: () => void;
  /** 보여줄 캐시가 없으면 null. */
  onShowCached: (() => void) | null;
}) {
  const styles = useStyles();

  const copy = failureCopy(kind);
  const tone = TONES[copy.tone];

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: tone.surface }]}>
        <Text style={styles.icon}>🌩</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: tone.surface }]}>
        <Text style={[styles.badgeText, { color: tone.text }]}>
          {copy.badgeIcon} {copy.badge}
        </Text>
      </View>

      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.message}>{copy.message}</Text>

      <View style={styles.hint}>
        <Text style={styles.hintText}>💡 {copy.hint}</Text>
      </View>

      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.primary,
          { backgroundColor: tone.accent },
          pressed && styles.pressed,
        ]}>
        <Text style={styles.primaryText}>↻ 다시 시도하기</Text>
      </Pressable>

      {onShowCached && (
        <Pressable
          onPress={onShowCached}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>이전에 불러온 데이터 보기</Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  wrap: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: AppSpacing.cardPad,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 42,
  },
  badge: {
    marginTop: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: AppRadius.chip,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: c.title,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: c.muted,
    textAlign: 'center',
  },
  hint: {
    marginTop: 18,
    alignSelf: 'stretch',
    padding: 12,
    borderRadius: AppRadius.card,
    backgroundColor: c.alertSurface,
    borderWidth: 1,
    borderColor: c.alertBorder,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 18,
    color: c.alertBody,
  },
  primary: {
    marginTop: 18,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: AppRadius.card,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondary: {
    marginTop: 10,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.body,
  },
  pressed: {
    opacity: 0.75,
  },
}));
