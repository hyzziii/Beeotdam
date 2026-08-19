import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing } from '@/constants/home-theme';

export function AiSummaryCard() {
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

      <Text style={styles.body}>
        오늘 서울 강남구는 <Text style={styles.emphasis}>오전 10시~오후 6시 사이 집중호우</Text>가
        예상됩니다. 최대 시간당 <Text style={styles.emphasis}>7.5㎜</Text>의 비가 내릴 수 있어 우산
        없이는 외출이 어려워요.
      </Text>

      <Pressable style={({ pressed }) => pressed && styles.pressed}>
        <Text style={styles.link}>수자원 연계 분석 더 보기 ▼</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: HomeSpacing.cardPad,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.accentSurface,
    borderWidth: 1,
    borderColor: HomeColors.accentBorder,
    marginBottom: HomeSpacing.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: HomeRadius.chip,
    backgroundColor: HomeColors.accent,
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
    color: HomeColors.title,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    color: HomeColors.accentText,
  },
  body: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 21,
    color: HomeColors.body,
  },
  emphasis: {
    fontWeight: '800',
    color: HomeColors.accentDeep,
  },
  link: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: HomeColors.accentText,
  },
  pressed: {
    opacity: 0.6,
  },
});
