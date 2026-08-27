/**
 * 테스트 설정.
 *
 * 지금 테스트는 화면이 아니라 순수 함수만 다룬다 — 격자 변환, 발표 시각 계산, 일출·일몰,
 * 홍수 경보 판정, 예보 파싱. 값을 넣으면 값이 나오는 것들이라 앱을 켤 필요도 API를 부를
 * 필요도 없다.
 *
 * jest-expo 프리셋을 쓰는 건 tsconfig의 '@/' 별칭과 TypeScript를 그대로 읽히기 위해서다.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
