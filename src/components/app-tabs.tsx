import Ionicons from '@expo/vector-icons/Ionicons';
import { TabList, TabListProps, TabSlot, TabTrigger, TabTriggerSlotProps, Tabs } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';
import { createStyles, useAppTheme } from '@/theme/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Figma의 탭바는 선택 항목이 파란 아이콘 + 파란 라벨인 커스텀 스타일이다.
 * NativeTabs는 안드로이드 네이티브 바라 이 스타일을 낼 수 없어 expo-router/ui로 직접 그린다.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home-outline" activeIcon="home" label="홈" />
          </TabTrigger>
          <TabTrigger name="water" href="/water" asChild>
            <TabButton icon="water-outline" activeIcon="water" label="수자원" />
          </TabTrigger>
          <TabTrigger name="weather" href="/weather" asChild>
            <TabButton icon="cloud-outline" activeIcon="cloud" label="날씨" />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="settings-outline" activeIcon="settings" label="설정" />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar(props: TabListProps) {
  const styles = useStyles();

  const insets = useSafeAreaInsets();

  return (
    <View {...props} style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {props.children}
    </View>
  );
}

function TabButton({
  icon,
  activeIcon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: IconName; activeIcon: IconName; label: string }) {
  const styles = useStyles();
  const theme = useAppTheme();

  const color = isFocused ? theme.accentText : theme.muted;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <Ionicons name={isFocused ? activeIcon : icon} size={22} color={color} />
      <Text style={[styles.label, { color }, isFocused && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = createStyles((c) => ({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.cardBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
  },
  labelSelected: {
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.6,
  },
}));
