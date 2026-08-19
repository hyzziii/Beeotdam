import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeColors, HomeRadius, HomeSpacing } from '@/constants/home-theme';
import { appInfo } from '@/data';

export function AppInfoCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.icons}>🌧️💧</Text>
      <Text style={styles.name}>{appInfo.name}</Text>
      <Text style={styles.tagline}>{appInfo.tagline}</Text>
      <Text style={styles.tagline}>{appInfo.dataSource}</Text>

      <View style={styles.links}>
        {appInfo.links.map((link) => (
          <Pressable key={link} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.link}>{link}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: HomeSpacing.cardPad,
    borderRadius: HomeRadius.card,
    backgroundColor: HomeColors.accentSurface,
    borderWidth: 1,
    borderColor: HomeColors.accentBorder,
    marginBottom: HomeSpacing.cardGap,
  },
  icons: {
    fontSize: 26,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: HomeColors.title,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: HomeColors.accentText,
  },
  links: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },
  link: {
    fontSize: 11,
    color: HomeColors.muted,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
});
