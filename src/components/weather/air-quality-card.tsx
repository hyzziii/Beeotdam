import { Text, View } from 'react-native';

import { AirGrade } from '@/api/airkorea';
import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing, pct } from '@/constants/app-theme';
import { createStyles } from '@/theme/theme-context';
import { useAir } from '@/weather/air-context';
import { failureMessage } from '@/weather/failure-message';

/** 등급별 색. 팔레트에 없는 색이라 여기서 정한다. */
const GRADE_COLORS: Record<AirGrade, { color: string; bg: string }> = {
  좋음: { color: '#16A34A', bg: '#EAF7EF' },
  보통: { color: '#D97706', bg: '#FEF6E7' },
  나쁨: { color: '#EA580C', bg: '#FEF0E7' },
  '매우 나쁨': { color: '#DC2626', bg: '#FDECEC' },
};

/**
 * 대기 환경.
 *
 * 에어코리아는 지역이 아니라 측정소 단위로 값을 준다. 그래서 어느 측정소에서 잰 값인지,
 * 그 측정소가 얼마나 떨어져 있는지를 아래에 밝힌다. 지역 이름과 측정소 이름이 다른
 * 경우가 많아(한강대로·청계천로 등) 밝히지 않으면 어디 값인지 알 수 없다.
 *
 * 자외선지수는 없다. 에어코리아가 아니라 기상청 생활기상지수 소관이고, 아직 붙이지 않았다.
 */
export function AirQualityCard() {
  const styles = useStyles();

  const { data, station, error, noStation } = useAir();

  if (noStation) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>대기 환경</Text>
        <Text style={styles.notice}>
          이 지역에서 30km 안에 있는 측정소가 없어요. 가까운 값을 그 지역 공기라고 할 수 없어
          보여주지 않습니다.
        </Text>
      </View>
    );
  }

  if (data === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>대기 환경</Text>
        {error ? (
          <Text style={styles.notice}>{failureMessage(error)}</Text>
        ) : (
          <View style={styles.skeletonList}>
            {Array.from({ length: 3 }, (_, index) => (
              <View key={index} style={styles.row}>
                <Skeleton width={54} height={12} />
                <View style={styles.track}>
                  <Skeleton width="40%" height={6} radius={3} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>대기 환경</Text>

      {data.metrics.map((metric) => {
        const grade = metric.grade ? GRADE_COLORS[metric.grade] : null;

        return (
          <View key={metric.label} style={styles.row}>
            <Text style={styles.label}>{metric.label}</Text>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: pct(Math.round(metric.ratio * 100)),
                    backgroundColor: grade?.color ?? '#94A3B8',
                  },
                ]}
              />
            </View>

            <Text style={styles.reading}>{metric.reading}</Text>

            {metric.grade && grade && (
              <View style={[styles.badge, { backgroundColor: grade.bg }]}>
                <Text style={[styles.badgeText, { color: grade.color }]}>({metric.grade})</Text>
              </View>
            )}
          </View>
        );
      })}

      <Text style={styles.source}>
        {data.stationName} 측정소
        {station && ` · ${station.km.toFixed(0)}km`} · {data.dataTime} 기준
      </Text>
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
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: c.title,
  },
  notice: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: c.muted,
  },
  skeletonList: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  label: {
    width: 54,
    fontSize: 11,
    color: c.body,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  reading: {
    width: 74,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: c.body,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  source: {
    marginTop: 12,
    fontSize: 9,
    color: c.muted,
  },
}));
