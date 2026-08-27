import { toDailyForecast } from './kma';

/*
 * 여기 있는 테스트는 실제로 났던 버그에서 나왔다.
 *
 * 주간 날씨의 금요일이 기온 없이 '—'로 떴다. 원인은 단기예보가 마지막 날짜를 한 시각만
 * 실어 보낸 것이었다 — 8월 24일 02시 발표는 28일치가 강수확률 하나뿐이고 최고·최저기온이
 * 없었다. 그걸 하루로 세면 주간 목록에서 중기예보를 덮어 그날 기온이 사라진다.
 *
 * 고친 규칙: 최고·최저기온이 둘 다 없는 '앞으로의 날짜'는 버린다. 오늘은 예외다 —
 * 늦은 시각에 조회하면 최저기온이 이미 지나가 응답에 없다.
 */

interface Item {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

/** 하루치 예보를 흉내낸다. 최고·최저기온과 시각별 값이 다 들어 있는 온전한 하루. */
function fullDay(date: string, { high, low }: { high: string; low: string }): Item[] {
  const items: Item[] = [
    { category: 'TMX', fcstDate: date, fcstTime: '1500', fcstValue: high },
    { category: 'TMN', fcstDate: date, fcstTime: '0600', fcstValue: low },
  ];

  for (const hour of ['0600', '1200', '1800']) {
    items.push(
      { category: 'POP', fcstDate: date, fcstTime: hour, fcstValue: '30' },
      { category: 'SKY', fcstDate: date, fcstTime: hour, fcstValue: '1' },
      { category: 'PTY', fcstDate: date, fcstTime: hour, fcstValue: '0' },
      { category: 'TMP', fcstDate: date, fcstTime: hour, fcstValue: '28' },
    );
  }

  return items;
}

/** 예보 맨 끝에 붙는 조각. 한 시각뿐이고 기온이 없다. */
function fragment(date: string): Item[] {
  return [{ category: 'POP', fcstDate: date, fcstTime: '2300', fcstValue: '30' }];
}

const TODAY = new Date(2026, 7, 27);

describe('단기예보 → 일별 예보', () => {
  it('기온이 없는 앞날 조각은 하루로 세지 않는다', () => {
    const items = [
      ...fullDay('20260827', { high: '33', low: '25' }),
      ...fullDay('20260828', { high: '31', low: '24' }),
      ...fragment('20260829'),
    ];

    const dates = toDailyForecast(items, TODAY).map((day) => day.date);

    expect(dates).toEqual(['20260827', '20260828']);
  });

  it('오늘은 기온이 둘 다 없어도 남긴다', () => {
    // 저녁에 조회하면 오늘의 TMN(새벽 6시 값)도 TMX(오후 3시 값)도 이미 빠져 있다.
    // 그렇다고 오늘을 목록에서 지우면 홈 화면의 오늘 카드가 사라진다.
    const items = [
      ...fragment('20260827'),
      ...fullDay('20260828', { high: '31', low: '24' }),
    ];

    const dates = toDailyForecast(items, TODAY).map((day) => day.date);

    expect(dates).toContain('20260827');
  });

  it('최고기온만 있어도 하루로 센다', () => {
    // 오후에 조회하면 최저기온만 빠진다. 그건 온전한 하루가 아니라고 볼 이유가 없다.
    const items = [
      ...fullDay('20260827', { high: '33', low: '25' }),
      { category: 'TMX', fcstDate: '20260828', fcstTime: '1500', fcstValue: '31' },
      { category: 'POP', fcstDate: '20260828', fcstTime: '1500', fcstValue: '20' },
    ];

    const dates = toDailyForecast(items, TODAY).map((day) => day.date);

    expect(dates).toContain('20260828');
  });

  it('날짜 순으로 정렬해서 준다', () => {
    const items = [
      ...fullDay('20260829', { high: '30', low: '23' }),
      ...fullDay('20260827', { high: '33', low: '25' }),
      ...fullDay('20260828', { high: '31', low: '24' }),
    ];

    const dates = toDailyForecast(items, TODAY).map((day) => day.date);

    expect(dates).toEqual(['20260827', '20260828', '20260829']);
  });

  it('강수확률은 그날 가장 높은 값을 쓴다', () => {
    const items = [
      ...fullDay('20260827', { high: '33', low: '25' }),
      { category: 'POP', fcstDate: '20260827', fcstTime: '2100', fcstValue: '80' },
    ];

    const [today] = toDailyForecast(items, TODAY);

    expect(today.rain).toBe(80);
  });

  it('기온을 읽어 온다', () => {
    const days = toDailyForecast(fullDay('20260827', { high: '33', low: '25' }), TODAY);

    expect(days[0].high).toBe(33);
    expect(days[0].low).toBe(25);
  });
});
