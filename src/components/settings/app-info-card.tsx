import { Pressable, Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { appInfo } from '@/data';

export function AppInfoCard() {
  const styles = useStyles();

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

const useStyles = createStyles((c) => ({
  card: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: c.accentSurface,
    borderWidth: 1,
    borderColor: c.accentBorder,
    marginBottom: AppSpacing.cardGap,
  },
  icons: {
    fontSize: 26,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: c.title,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: c.accentText,
  },
  links: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },
  link: {
    fontSize: 11,
    color: c.muted,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
}));
