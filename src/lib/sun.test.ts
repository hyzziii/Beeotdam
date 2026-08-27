import { sunTimes } from './sun';

/*
 * 일출·일몰은 API에서 받지 않고 지역 좌표로 직접 계산한다(NOAA 계산식). 값이 그럴듯하게
 * 틀려도 화면만 봐서는 모르므로, 한국천문연구원이 발표하는 값과 맞춰 둔다.
 *
 * 몇 분 차이는 둔다. 계산식은 지평선을 수평면으로 보고 대기 굴절을 평균값으로 잡지만,
 * 실제 발표값은 관측 지점의 고도와 그날의 대기 상태를 반영한다. 1~2분은 그 차이다.
 */

/** 'HH:MM'을 분으로. 시각 비교를 분 단위로 하려고 쓴다. */
const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** 두 시각이 몇 분 떨어져 있는지. */
const gap = (a: string, b: string) => Math.abs(minutes(a) - minutes(b));

const SEOUL = { lat: 37.5665, lng: 126.978 };

describe('일출·일몰', () => {
  it('서울 8월 24일은 05:55 / 19:14 언저리', () => {
    // 이 계산식을 붙일 때 실제 발표값(05:56 / 19:12)과 대조해 1~2분 차이를 확인했다.
    // 그때 맞춘 값이라 기준으로 삼는다.
    const { sunrise, sunset } = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, 7, 24));

    expect(gap(sunrise!, '05:56')).toBeLessThanOrEqual(3);
    expect(gap(sunset!, '19:12')).toBeLessThanOrEqual(3);
  });

  it('서울 하지(6/21) 무렵은 일출이 이르고 낮이 길다', () => {
    const { sunrise, sunset } = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, 5, 21));

    expect(sunrise).not.toBeNull();
    expect(sunset).not.toBeNull();
    // 한국천문연구원 발표: 서울 05:11 / 19:57
    expect(gap(sunrise!, '05:11')).toBeLessThanOrEqual(3);
    expect(gap(sunset!, '19:57')).toBeLessThanOrEqual(3);
  });

  it('서울 동지(12/21) 무렵은 일출이 늦고 낮이 짧다', () => {
    const { sunrise, sunset } = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, 11, 21));

    // 한국천문연구원 발표: 서울 07:43 / 17:17
    expect(gap(sunrise!, '07:43')).toBeLessThanOrEqual(3);
    expect(gap(sunset!, '17:17')).toBeLessThanOrEqual(3);
  });

  it('낮은 하지가 동지보다 길다', () => {
    const summer = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, 5, 21));
    const winter = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, 11, 21));

    const dayLength = (t: { sunrise: string | null; sunset: string | null }) =>
      minutes(t.sunset!) - minutes(t.sunrise!);

    expect(dayLength(summer)).toBeGreaterThan(dayLength(winter));
  });

  it('같은 날이면 동쪽이 먼저 해가 뜬다', () => {
    const date = new Date(2026, 8, 27);
    const seoul = sunTimes(SEOUL.lat, SEOUL.lng, date);
    const gangneung = sunTimes(37.7519, 128.8761, date);

    expect(minutes(gangneung.sunrise!)).toBeLessThan(minutes(seoul.sunrise!));
  });

  it('일출은 늘 일몰보다 이르다', () => {
    for (const month of [0, 3, 6, 9]) {
      const { sunrise, sunset } = sunTimes(SEOUL.lat, SEOUL.lng, new Date(2026, month, 15));
      expect(minutes(sunrise!)).toBeLessThan(minutes(sunset!));
    }
  });
});
