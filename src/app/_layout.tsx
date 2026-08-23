import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SettingsProvider, useSettings } from '@/settings/settings-context';
import { ThemeProvider, useThemeControl } from '@/theme/theme-context';
import { DamsProvider } from '@/water/dam-context';
import { WeatherProvider } from '@/weather/weather-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <WeatherProvider>
          <DamsProvider>
            <ThemedApp />
          </DamsProvider>
        </WeatherProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

/**
 * 앱 테마는 ThemeProvider가 들고 있고, 내비게이션 크롬과 상태바는 별도로 알려줘야
 * 한다. useThemeControl은 Provider 안에서만 쓸 수 있어 컴포넌트를 한 겹 나눴다.
 */
function ThemedApp() {
  const { scheme, ready: themeReady } = useThemeControl();
  const { ready: settingsReady } = useSettings();

  return (
    <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay ready={themeReady && settingsReady} />
      <AppTabs />
    </NavigationThemeProvider>
  );
}
