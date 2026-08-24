import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles, useAppTheme } from '@/theme/theme-context';

import { HourlyRain } from '@/api/kma';
import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, RAIN_HIGHLIGHT } from '@/constants/app-theme';

const BAR_MAX_HEIGHT = 64;
/** 0%인 시각도 칸이 있다는 건 보이게 둔다. */
const BAR_MIN_HEIGHT = 6;

/**
 * 막대 높이. 강수확률 0~100%을 그대로 축으로 쓴다.
 *
 * 전에는 강수량(mm)을 높이로 썼다. 비 안 오는 날은 온종일 0.0mm라 모든 막대가 최소
 * 높이로 붙어 0%와 30%가 구별되지 않았다. 확률은 늘 값이 있어 그래프가 항상 읽힌다.
 * 강수량은 0보다 클 때만 아래에 mm로 적는다.
 */
function barHeight(prob: number) {
  const ratio = Math.min(Math.max(prob, 0), 100) / 100;
  return BAR_MIN_HEIGHT + ratio * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);
}

/** 칸 하나의 폭. 스타일과 스크롤 계산이 어긋나지 않게 한곳에서 쓴다. */
const COLUMN_WIDTH = 42;
/** 현재 칸을 왼쪽 끝에 딱 붙이지 않고 앞쪽을 조금 남긴다. */
const SCROLL_LEAD = 1;

export function HourlyRainCard({
  hourly,
  date,
}: {
  hourly: HourlyRain[] | null;
  /** hourly가 어느 날짜인지(YYYYMMDD). 부제목을 오늘/내일로 맞추는 데 쓴다. */
  date: string | null;
}) {
  const styles = useStyles();
  const theme = useAppTheme();

  const chart = useRef<ScrollView>(null);
  const scrolled = useRef(false);

  // 오늘을 보여줄 때만 '지난 시각' 개념이 있다
  const showingToday = describeDay(date) === '오늘';
  const nowHour = new Date().getHours();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>시간대별 강수</Text>
          <Text style={styles.subtitle}>{describeDay(date)} 오전 6시 ~ 오후 8시</Text>
        </View>

        {/* 막대가 하나뿐이라 범례도 하나다. 둘을 걸어 두면 없는 계열을 약속하는 셈이다. */}
        <View style={styles.legend}>
          <LegendItem color={theme.accent} label="강수확률" />
        </View>
      </View>

      <ScrollView
        ref={chart}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chart}
        onContentSizeChange={() => {
          /*
            처음 그려질 때 한 번만 현재 시각으로 옮긴다. 오후에 열면 앞쪽 지난 시간만
            보여서 매번 오른쪽으로 끌어야 했다. 매번 옮기면 사용자가 스크롤해 둔 위치를
            빼앗으므로 첫 회로 제한한다.
          */
          if (scrolled.current || !showingToday || hourly === null) return;
          scrolled.current = true;

          const index = hourly.findIndex((item) => Number(item.hour.slice(0, 2)) >= nowHour);
          if (index <= SCROLL_LEAD) return;

          chart.current?.scrollTo({
            x: (index - SCROLL_LEAD) * COLUMN_WIDTH,
            animated: false,
          });
        }}>
        {hourly === null &&
          // 값이 들어올 자리를 미리 잡아 둔다. 안 그러면 카드가 납작하다 갑자기 커진다.
          Array.from({ length: 8 }, (_, index) => (
            <View key={index} style={styles.column}>
              <Skeleton width={28} height={12} />
              <View style={styles.barSlot}>
                <Skeleton width={16} height={20 + ((index * 7) % 32)} radius={4} />
              </View>
              <Skeleton width={26} height={11} />
            </View>
          ))}

        {(hourly ?? []).map((item) => {
          const active = item.prob >= RAIN_HIGHLIGHT;
          // 이미 지난 시각은 흐리게 둔다. 오늘 흐름은 보이되 앞으로가 눈에 띄게.
          const past = showingToday && Number(item.hour.slice(0, 2)) < nowHour;

          return (
            <View key={item.hour} style={[styles.column, past && styles.columnPast]}>
              <Text style={[styles.prob, active && styles.probActive]}>{item.prob}%</Text>

              <View style={styles.barSlot}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(item.prob) },
                    active ? styles.barActive : styles.barInactive,
                  ]}
                />
              </View>

              {/* Figma: 강수량 0인 시간대는 mm 라벨 없이 시각만 위로 올라온다 */}
              {item.amount > 0 && (
                <Text style={[styles.amount, active && styles.amountActive]}>{item.amount}㎜</Text>
              )}

              <Text style={[styles.hour, active && styles.hourActive]}>{item.hour}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * 부제목의 날짜. 발표가 늦은 시각이면 오늘 06시가 이미 지나 다음 날 예보를 보여주므로
 * '오늘'로 고정하면 틀린 말이 된다.
 */
function describeDay(date: string | null) {
  if (date === null) return '오늘';

  const now = new Date();
  const pad2 = (value: number) => String(value).padStart(2, '0');
  const key = (target: Date) =>
    `${target.getFullYear()}${pad2(target.getMonth() + 1)}${pad2(target.getDate())}`;

  if (date === key(now)) return '오늘';

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === key(tomorrow)) return '내일';

  return `${Number(date.slice(4, 6))}월 ${Number(date.slice(6, 8))}일`;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const styles = useStyles();

  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const useStyles = createStyles((c) => ({
  card: {
    padding: AppSpacing.cardPad,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    marginBottom: AppSpacing.cardGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: c.accentText,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 9,
    color: c.muted,
  },
  chart: {
    // 위 기준 정렬이라 강수확률 줄이 가지런히 맞고, mm 라벨이 없는 컬럼(강수량 0)은
    // 시각 라벨이 위로 올라온다 — Figma의 어긋난 베이스라인이 이 방향이다.
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingRight: 4,
  },
  column: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
  },
  columnPast: {
    opacity: 0.4,
  },
  prob: {
    fontSize: 10,
    fontWeight: '600',
    color: c.faint,
  },
  probActive: {
    fontWeight: '800',
    color: c.accentText,
  },
  barSlot: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  bar: {
    width: 20,
    borderRadius: AppRadius.bar,
  },
  barActive: {
    backgroundColor: c.accent,
  },
  barInactive: {
    backgroundColor: c.track,
  },
  amount: {
    marginTop: 7,
    fontSize: 9,
    color: c.faint,
  },
  amountActive: {
    fontWeight: '700',
    color: c.accentText,
  },
  hour: {
    marginTop: 4,
    fontSize: 10,
    color: c.faint,
  },
  hourActive: {
    color: c.accentText,
  },
}));
