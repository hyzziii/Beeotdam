import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeColors, HomeRadius } from '@/constants/home-theme';

/**
 * 아직 만들지 않은 탭을 위한 자리 표시 화면.
 * expo-router는 src/app 아래 모든 파일을 라우트로 잡기 때문에, 빈 파일은
 * "missing the required default export" 경고를 낸다. 그 자리를 채워준다.
 */
export function PlaceholderScreen({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>준비 중</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HomeColors.screen,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: HomeColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: HomeColors.title,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: HomeColors.muted,
  },
  pill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: HomeRadius.chip,
    backgroundColor: HomeColors.accentSurface,
    borderWidth: 1,
    borderColor: HomeColors.accentBorder,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: HomeColors.accentText,
  },
});
