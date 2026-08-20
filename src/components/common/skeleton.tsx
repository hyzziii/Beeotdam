import { DimensionValue, View } from 'react-native';

import { createStyles } from '@/theme/theme-context';

/**
 * 값이 들어올 자리를 미리 잡아 두는 회색 블록.
 *
 * 첫 실행처럼 보여줄 값이 하나도 없을 때만 쓴다. 캐시가 있으면 지난 값을 보여주는 편이
 * 나으므로 스켈레톤은 나오지 않는다.
 *
 * 자리를 미리 차지하는 게 핵심이다. 빈 화면에 값이 나중에 끼어들면 레이아웃이 밀리면서
 * 눌리던 것이 어긋난다.
 */
export function Skeleton({
  width,
  height,
  radius = 6,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
}) {
  const styles = useStyles();

  return (
    <View
      accessibilityLabel="불러오는 중"
      style={[styles.block, { width, height, borderRadius: radius }]}
    />
  );
}

const useStyles = createStyles((c) => ({
  block: {
    backgroundColor: c.track,
    opacity: 0.5,
  },
}));
