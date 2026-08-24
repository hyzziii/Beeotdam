import { Text, View } from 'react-native';
import { createStyles } from '@/theme/theme-context';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { dataSources } from '@/data';

/**
 * 데이터 출처.
 *
 * 화면에 뜨는 수치는 전부 공공데이터포털에서 받은 공공저작물이다. 출처를 밝히는 건 예의가
 * 아니라 이용허락 조건이다 — 기상청은 공공누리 제1유형, 한국환경공단은 제3유형으로
 * 출처표시를 요구한다. 한국수자원공사만 제한이 없는데, 셋을 나란히 적는다.
 *
 * 기관별로 묶어서 보여준다. 유형이 기관마다 달라서 서비스만 늘어놓으면 어느 조건이
 * 어디에 걸리는지 알 수 없다.
 *
 * 서비스 페이지는 공공누리 배지와 크리에이티브 커먼즈 배지를 나란히 건다. 같은 조건을
 * 두 번 적은 것이라 둘을 한 줄에 병기한다.
 */
export function DataSourceCard() {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>데이터 출처</Text>
      <Text style={styles.lead}>
        공공데이터포털(data.go.kr)에서 받은 공공저작물입니다. 기관마다 이용허락범위가 다릅니다.
      </Text>

      {dataSources.map((source) => (
        <View key={source.agency} style={styles.entry}>
          <Text style={styles.agency}>{source.agency}</Text>
          <Text style={styles.license}>
            {source.license}
            {source.cc && ` · ${source.cc}`}
          </Text>

          {source.services.map((service) => (
            <Text key={service} style={styles.service}>
              · {service}
            </Text>
          ))}
        </View>
      ))}

      {/*
        제3유형의 '변경금지' 때문에 대기 환경은 받은 값을 그대로 보여준다. 등급도 우리가
        구간을 만들지 않고 응답에 실려 온 등급을 쓴다.
      */}
      <Text style={styles.note}>
        대기 환경의 농도와 등급은 받은 값을 그대로 보여줍니다. 저수율과 기온도 계산하지 않고
        기관이 준 값을 씁니다.
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
  lead: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: c.muted,
  },
  entry: {
    marginTop: 14,
  },
  agency: {
    fontSize: 12,
    fontWeight: '700',
    color: c.body,
  },
  license: {
    marginTop: 2,
    fontSize: 10,
    color: c.accentText,
  },
  service: {
    marginTop: 3,
    fontSize: 10,
    color: c.muted,
  },
  note: {
    marginTop: 16,
    fontSize: 10,
    lineHeight: 16,
    color: c.faint,
  },
}));
