import { ultraSrtNcstBase, vilageFcstBase } from './kma-time';

/*
 * 기상청은 정해진 시각에만 예보를 내고, 그 시각을 인자로 넘겨야 한다. 발표 직후에는 아직
 * 안 올라와 있어 여유를 두고 이전 발표를 골라야 하는데, 그 경계를 잘못 잡으면 NO_DATA가
 * 돌아온다. 화면에는 '데이터 없음'으로만 보여서 원인을 찾기 어렵다.
 */

/** 테스트 날짜를 짧게 쓰기 위한 도우미. 월은 0부터라 헷갈려서 감싼다. */
const at = (year: number, month: number, day: number, hour: number, minute: number) =>
  new Date(year, month - 1, day, hour, minute);

describe('단기예보 발표 시각', () => {
  it('발표 15분이 지나면 그 발표를 쓴다', () => {
    expect(vilageFcstBase(at(2026, 8, 27, 14, 20))).toEqual({
      baseDate: '20260827',
      baseTime: '1400',
    });
  });

  it('발표 직후에는 아직 안 올라와 이전 발표를 쓴다', () => {
    // 14시 발표는 14:15부터 조회된다. 14:10이면 아직 11시 발표뿐이다.
    expect(vilageFcstBase(at(2026, 8, 27, 14, 10))).toEqual({
      baseDate: '20260827',
      baseTime: '1100',
    });
  });

  it('자정과 02시 15분 사이는 전날 23시 발표로 넘어간다', () => {
    expect(vilageFcstBase(at(2026, 8, 27, 1, 0))).toEqual({
      baseDate: '20260826',
      baseTime: '2300',
    });
  });

  it('02시 15분을 넘기면 그날 02시 발표로 바뀐다', () => {
    expect(vilageFcstBase(at(2026, 8, 27, 2, 16))).toEqual({
      baseDate: '20260827',
      baseTime: '0200',
    });
  });

  it('달이 바뀌는 자정에도 전날로 제대로 넘어간다', () => {
    expect(vilageFcstBase(at(2026, 9, 1, 0, 30))).toEqual({
      baseDate: '20260831',
      baseTime: '2300',
    });
  });
});

describe('초단기실황 관측 시각', () => {
  it('45분이 지나면 그 시각 관측을 쓴다', () => {
    expect(ultraSrtNcstBase(at(2026, 8, 27, 14, 50))).toEqual({
      baseDate: '20260827',
      baseTime: '1400',
    });
  });

  it('45분 전에는 이전 시각 관측을 쓴다', () => {
    expect(ultraSrtNcstBase(at(2026, 8, 27, 14, 20))).toEqual({
      baseDate: '20260827',
      baseTime: '1300',
    });
  });

  it('00시 45분 전에는 전날 23시 관측으로 넘어간다', () => {
    expect(ultraSrtNcstBase(at(2026, 8, 27, 0, 20))).toEqual({
      baseDate: '20260826',
      baseTime: '2300',
    });
  });
});
