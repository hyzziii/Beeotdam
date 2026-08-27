import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SettingsProvider, useSettings } from '@/settings/settings-context';
import { ThemeProvider, useThemeControl } from '@/theme/theme-context';
import { DamsProvider } from '@/water/dam-context';
import { AirProvider } from '@/weather/air-context';
import { WeatherProvider } from '@/weather/weather-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <WeatherProvider>
          <AirProvider>
            <DamsProvider>
              <ThemedApp />
            </DamsProvider>
          </AirProvider>
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
      {/*
        웹 문서 제목. +html.tsx에 적으면 expo-router가 먼저 끼워 넣는 빈 <title>에 밀린다.
        Head는 그 빈 자리를 채우는 통로다. 네이티브에서는 하는 일이 없다.
      */}
      <Head>
        <title>비왔댐</title>
        <meta
          name="description"
          content="내 지역의 비와 물 상황을 한눈에. 날씨 예보와 댐 저수율을 함께 봅니다."
        />
      </Head>

      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay ready={themeReady && settingsReady} />
      <AppTabs />
    </NavigationThemeProvider>
  );
}
