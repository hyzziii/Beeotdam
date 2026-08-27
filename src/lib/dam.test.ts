import { floodAlert } from './dam';

/*
 * 홍수 경보는 저수율 배지와 달리 계산할 근거가 있다. 댐마다 정해진 수위가 제원 API에
 * 있고 현재 수위는 운영 API가 준다. 전국 공통 기준을 임의로 만들 필요가 없다.
 *
 * 경계에서 어느 쪽으로 붙는지가 중요하다. 기준을 '넘었을 때'가 아니라 '닿았을 때'부터
 * 알리기로 했으므로 같은 값도 경보다.
 */

/** 소양강댐 제원. dam-catalog.ts에 적어 둔 값이다. */
const soyang = {
  low: 150,
  floodLimit: 190.3,
  normalHigh: 193.5,
  designFlood: 198,
};

describe('홍수 경보 판정', () => {
  it('평상시에는 아무것도 붙지 않는다', () => {
    expect(floodAlert(180, soyang)).toBeNull();
  });

  it('홍수기 제한수위에 닿으면 floodLimit', () => {
    expect(floodAlert(190.3, soyang)).toBe('floodLimit');
  });

  it('홍수기 제한수위를 넘으면 floodLimit', () => {
    expect(floodAlert(195, soyang)).toBe('floodLimit');
  });

  it('계획홍수위에 닿으면 designFlood', () => {
    expect(floodAlert(198, soyang)).toBe('designFlood');
  });

  it('계획홍수위를 넘으면 제한수위가 아니라 designFlood가 이긴다', () => {
    // 계획홍수위를 넘었으면 제한수위도 당연히 넘었다. 더 심각한 쪽을 골라야 한다.
    expect(floodAlert(200, soyang)).toBe('designFlood');
  });

  it('제한수위 바로 아래는 경보가 아니다', () => {
    expect(floodAlert(190.2, soyang)).toBeNull();
  });

  it('저수위 아래로 내려가도 홍수 경보는 없다', () => {
    // 가뭄 쪽은 이 함수가 다루지 않는다. 저수율만으로 가뭄 단계를 정할 근거가 없어서다.
    expect(floodAlert(140, soyang)).toBeNull();
  });
});
