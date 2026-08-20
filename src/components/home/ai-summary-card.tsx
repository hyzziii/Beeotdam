import { useCallback, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextLayoutEventData,
  View,
} from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppRadius, AppSpacing } from '@/constants/app-theme';

/** 접힌 상태에서 보여줄 본문 줄 수. */
const COLLAPSED_LINES = 2;

export function AiSummaryCard() {
  const styles = useStyles();

  const [expanded, setExpanded] = useState(false);
  const [fullLines, setFullLines] = useState<number | null>(null);

  const handleMeasure = useCallback((event: NativeSyntheticEvent<TextLayoutEventData>) => {
    setFullLines(event.nativeEvent.lines.length);
  }, []);

  const body = (
    <>
      오늘 서울 강남구는 <Text style={styles.emphasis}>오전 10시~오후 6시 사이 집중호우</Text>가
      예상됩니다. 최대 시간당 <Text style={styles.emphasis}>7.5㎜</Text>의 비가 내릴 수 있어 우산
      없이는 외출이 어려워요.
    </>
  );

  const overflows = fullLines !== null && fullLines > COLLAPSED_LINES;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeGlyph}>✦</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>AI 오늘의 날씨 요약</Text>
          <Text style={styles.subtitle}>날씨 + 수자원 데이터 기반 분석</Text>
        </View>
      </View>

      <View style={styles.bodyWrap}>
        <Text style={styles.body} numberOfLines={expanded ? undefined : COLLAPSED_LINES}>
          {body}
        </Text>

        {/*
          numberOfLines가 걸린 Text는 onTextLayout이 잘린 줄까지만 보고하므로
          실제 줄 수를 알 수 없다. 그래서 같은 폭의 투명한 사본을 한 번만 그려
          전체 줄 수를 재고, 측정이 끝나면 언마운트한다.
        */}
        {fullLines === null && (
          <Text
            style={[styles.body, styles.measurer]}
            onTextLayout={handleMeasure}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            {body}
          </Text>
        )}
      </View>

      {overflows && (
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.link}>
            {expanded ? '수자원 연계 분석 접기 ▲' : '수자원 연계 분석 더 보기 ▼'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  card: {
    padding: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: c.accentSurface,
    borderWidth: 1,
    borderColor: c.accentBorder,
    marginBottom: AppSpacing.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: AppRadius.chip,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    color: c.accentText,
  },
  bodyWrap: {
    marginTop: 12,
  },
  body: {
    fontSize: 13,
    lineHeight: 21,
    color: c.body,
  },
  measurer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
  emphasis: {
    fontWeight: '800',
    color: c.accentDeep,
  },
  link: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: c.accentText,
  },
  pressed: {
    opacity: 0.6,
  },
}));
