import { toGrid } from './grid';

/*
 * 기상청은 위경도가 아니라 5km 격자 번호로 예보를 준다. 변환이 틀리면 옆 동네 날씨가
 * 나오는데, 값이 그럴듯해서 화면만 봐서는 알 수 없다.
 *
 * 도시별 격자 번호를 여럿 박아 두고 싶었지만 그만두었다. 기상청이 배포하는 '단기예보
 * 지점 좌표' 표를 직접 확인하지 않고 기억으로 적으면, 틀린 기대값이 맞는 코드를
 * 실패시킨다. 실제로 처음에 그렇게 적었다가 부산과 강릉이 어긋났다.
 *
 * 그래서 확실한 것 하나만 고정한다. 서울 (37.5665, 126.9780) → (60, 127)은 기상청이
 * 배포하는 변환 예제 코드에 그대로 나오는 짝이다. 나머지는 좌표를 몰라도 참인 성질로
 * 검증한다 — 투영식이 깨지면 이쪽이 먼저 무너진다.
 */
describe('위경도 → 기상청 격자', () => {
  it('서울 (37.5665, 126.9780)은 격자 (60, 127)', () => {
    expect(toGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });

  it('격자 번호는 정수다', () => {
    const { nx, ny } = toGrid(35.1796, 129.0756);
    expect(Number.isInteger(nx)).toBe(true);
    expect(Number.isInteger(ny)).toBe(true);
  });

  it('남한 어디를 넣어도 격자 범위(149 x 253) 안에 들어간다', () => {
    const corners: [number, number][] = [
      [38.6, 128.4], // 북쪽 끝 고성
      [33.1, 126.2], // 남쪽 끝 마라도
      [37.5, 124.6], // 서쪽 끝 백령도
      [37.2, 131.9], // 동쪽 끝 독도
    ];

    for (const [lat, lng] of corners) {
      const { nx, ny } = toGrid(lat, lng);
      expect(nx).toBeGreaterThanOrEqual(1);
      expect(nx).toBeLessThanOrEqual(149);
      expect(ny).toBeGreaterThanOrEqual(1);
      expect(ny).toBeLessThanOrEqual(253);
    }
  });

  it('동쪽으로 가면 nx가 커지고, 북쪽으로 가면 ny가 커진다', () => {
    const seoul = toGrid(37.5665, 126.978);

    expect(toGrid(37.5665, 129.0).nx).toBeGreaterThan(seoul.nx);
    expect(toGrid(38.2, 126.978).ny).toBeGreaterThan(seoul.ny);
  });

  it('같은 좌표는 항상 같은 격자를 준다', () => {
    expect(toGrid(35.8714, 128.6014)).toEqual(toGrid(35.8714, 128.6014));
  });
});
