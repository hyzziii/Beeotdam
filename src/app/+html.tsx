import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * 웹에서 정적으로 뽑는 HTML의 껍데기. 네이티브에는 영향이 없다.
 *
 * 이 파일이 없으면 expo-router가 기본 껍데기를 쓰는데, 거기엔 제목이 비어 있어 브라우저
 * 탭에 주소가 그대로 뜨고 lang이 en으로 나간다. 화면은 전부 한국어다.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          제목과 설명은 여기 두지 않는다. expo-router가 react-helmet으로 <title data-rh>를
          먼저 끼워 넣는데, 브라우저는 첫 번째 <title>을 쓰므로 여기 적어도 빈 제목에 진다.
          _layout.tsx의 <Head>에서 넣는다.
        */}

        {/* 주소창·탭 색. 라이트는 화면 배경(screen), 다크는 다크 팔레트의 화면 배경. */}
        <meta name="theme-color" content="#F4F8FC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)" />

        {/*
          body의 스크롤을 끄고 ScrollView가 스크롤을 맡게 한다. 이게 없으면 웹에서
          화면 전체가 같이 움직여 네이티브와 다르게 동작한다.
        */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
