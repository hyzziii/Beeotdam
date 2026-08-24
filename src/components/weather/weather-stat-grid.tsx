import { Text, View } from 'react-native';

import { CurrentWeather } from '@/api/kma';
import { Skeleton } from '@/components/common/skeleton';
import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { SunTimes } from '@/lib/sun';
import { createStyles } from '@/theme/theme-context';

/**
 * 16방위 이름. 풍향은 도(deg)로 오므로 22.5° 간격으로 나눠 읽는다.
 * 기상청 기준으로 0°가 북풍이고 시계 방향으로 돈다.
 */
const COMPASS = [
  '북', '북북동', '북동', '동북동',
  '동', '동남동', '남동', '남남동',
  '남', '남남서', '남서', '서남서',
  '서', '서북서', '북서', '북북서',
];

function windName(deg: number) {
  return COMPASS[Math.round(deg / 22.5) % 16];
}

/**
 * 풍속·습도·일출·일몰을 2열 타일로 보여준다.
 *
 * 원래 시안에는 기압과 가시거리 타일도 있었지만 뺐다. 단기예보·초단기실황에 그 값이
 * 없고(종관기상관측 API를 따로 신청해야 한다), 빈 값을 계속 띄우면 고장처럼 보인다.
 *
 * 일출·일몰은 API 값이 아니라 지역 좌표로 계산한 값이다(lib/sun.ts).
 */
export function WeatherStatGrid({
  current,
  sun,
}: {
  current: CurrentWeather | null;
  sun: SunTimes | null;
}) {
  const styles = useStyles();

  if (current === null) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={styles.tile}>
            <Skeleton width={18} height={18} radius={9} />
            <View style={styles.text}>
              <Skeleton width={54} height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  const stats = [
    {
      icon: '🌀',
      value: current.windSpeed === null ? '—' : `${current.windSpeed} m/s`,
      label: current.windDeg === null ? '풍속' : `풍속 · ${windName(current.windDeg)}풍`,
    },
    {
      icon: '💧',
      value: current.humidity === null ? '—' : `${current.humidity}%`,
      label: '습도',
    },
    { icon: '🌅', value: sun?.sunrise ?? '—', label: '일출' },
    { icon: '🌇', value: sun?.sunset ?? '—', label: '일몰' },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.tile}>
          <Text style={styles.icon}>{stat.icon}</Text>
          <View style={styles.text}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = createStyles((c) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: AppSpacing.cardGap,
  },
  tile: {
    // 두 열로 나누되 gap 8을 빼야 3열로 넘어가지 않는다
    width: '48.5%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: AppRadius.card,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: c.title,
  },
  label: {
    marginTop: 2,
    fontSize: 9,
    color: c.muted,
  },
}));
