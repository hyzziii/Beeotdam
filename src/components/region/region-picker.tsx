import { useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRadius, AppSpacing } from '@/constants/app-theme';
import { Region, SIDO_LIST, regionLabel, regions } from '@/data';
import { useSettings } from '@/settings/settings-context';
import { createStyles, useAppTheme } from '@/theme/theme-context';

/**
 * 지역을 고르는 바텀시트.
 *
 * 고르면 그 지역을 보게 되고, 본 곳은 최근 목록에 자동으로 쌓인다. 담아두는 조작이
 * 따로 없어 사용자가 관리할 것이 없다.
 *
 * expo-router의 formSheet 대신 Modal로 직접 그린다. 이 앱은 Stack이 아니라
 * expo-router/ui의 Tabs 위에 올라가 있어 formSheet를 쓰려면 라우팅을 갈아야 하고,
 * 시트 손잡이(sheetGrabberVisible)는 iOS 전용이라 안드로이드에서 안 보인다.
 */
/** 시/도 한 줄의 높이. 현재 시/도로 스크롤할 위치를 계산하는 데 쓴다. */
const SIDO_ROW_HEIGHT = 44;

export function RegionPicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const theme = useAppTheme();

  const { activeRegion, setActiveRegion, recentRegions } = useSettings();

  const [sido, setSido] = useState(activeRegion.sido);
  const [query, setQuery] = useState('');

  const sidoList = useRef<FlatList<string>>(null);

  const keyword = query.trim();

  /**
   * 검색 중에는 시/도를 가로질러 찾는다. '동탄'을 치는 사람은 그게 경기도인지
   * 먼저 고르고 싶지는 않다.
   */
  const listed = useMemo(() => {
    if (!keyword) return regions.filter((region) => region.sido === sido);
    return regions.filter(
      (region) => region.district.includes(keyword) || region.sido.includes(keyword),
    );
  }, [keyword, sido]);

  const handlePick = (region: Region) => {
    setActiveRegion(region.code);
    onClose();
  };

  // 시트를 닫았다 열면 지금 보는 지역에서 다시 시작하는 편이 자연스럽다
  const handleShow = () => {
    setSido(activeRegion.sido);
    setQuery('');

    /*
     * 목록을 현재 시/도까지 내려준다. 전남광주처럼 아래쪽에 있는 시/도를 보고 있으면
     * 목록은 서울부터 보여주는데 선택 표시는 화면 밖에 있어, 오른쪽에 전남광주 지역이
     * 뜨는데 왼쪽은 서울이 맨 위라 어디가 골라졌는지 알 수 없다.
     *
     * scrollToIndex는 아직 그려지지 않은 항목으로 뛰면 예외를 던지므로, 줄 높이가
     * 일정한 점을 이용해 위치를 직접 계산한다.
     */
    // SIDO_LIST는 as const라 indexOf가 리터럴 타입만 받는다. 비교로 찾으면 그 제약이 없다.
    const index = SIDO_LIST.findIndex((item) => item === activeRegion.sido);
    if (index > 0) {
      sidoList.current?.scrollToOffset({ offset: index * SIDO_ROW_HEIGHT, animated: false });
    }
  };

  return (
    <Modal
      visible={visible}
      onShow={handleShow}
      onRequestClose={onClose}
      animationType="slide"
      transparent>
      {/* 시트 위 어두운 영역. 눌러서 닫는다. */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기" />

      <View style={styles.sheet}>
        <SafeAreaView edges={['bottom']} style={styles.sheetBody}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>지역 선택</Text>
              <Text style={styles.subtitle}>현재: {regionLabel(activeRegion)}</Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Text style={styles.closeGlyph}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.search}>
            <Text style={styles.searchGlyph}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="강남, 해운대, 수원… 검색"
              placeholderTextColor={theme.muted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>

          {recentRegions.length > 0 && !keyword && (
            <View style={styles.recent}>
              <Text style={styles.columnHead}>최근 본 지역</Text>
              {/* 이름이 길어 줄바꿈하면 칩 개수에 따라 목록이 밀려 내려간다.
                  가로로 흘려보내면 몇 개가 담기든 높이가 그대로다. */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}>
                {recentRegions.map((region) => (
                  <Pressable
                    key={region.code}
                    onPress={() => handlePick(region)}
                    accessibilityRole="button"
                    accessibilityLabel={`${region.sido} ${region.district} 보기`}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
                    <Text style={styles.chipText}>{regionLabel(region)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.columns}>
            {/* 검색 중에는 결과가 시/도를 가로지르므로 왼쪽 선택이 의미를 잃는다 */}
            <View style={[styles.sidoColumn, !!keyword && styles.dimmed]}>
              <Text style={styles.columnHead}>시 / 도</Text>
              <FlatList
                ref={sidoList}
                data={SIDO_LIST}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const current = !keyword && item === sido;

                  return (
                    <Pressable
                      onPress={() => {
                        setQuery('');
                        setSido(item);
                      }}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: current }}
                      style={({ pressed }) => [
                        styles.sidoRow,
                        current && styles.sidoRowCurrent,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.sidoName, current && styles.sidoNameCurrent]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            <View style={styles.districtColumn}>
              <Text style={styles.columnHead}>{keyword ? '검색 결과' : '시 / 군 / 구'}</Text>
              <FlatList
                data={listed}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.empty}>찾는 지역이 없어요.</Text>}
                renderItem={({ item }) => (
                  <DistrictRow
                    region={item}
                    showSido={!!keyword}
                    viewing={item.code === activeRegion.code}
                    onPick={() => handlePick(item)}
                  />
                )}
              />
            </View>
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
}

function DistrictRow({
  region,
  showSido,
  viewing,
  onPick,
}: {
  region: Region;
  showSido: boolean;
  viewing: boolean;
  onPick: () => void;
}) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPick}
      accessibilityRole="button"
      accessibilityLabel={`${region.sido} ${region.district} 보기`}
      style={({ pressed }) => [styles.districtRow, pressed && styles.pressed]}>
      {/* 왼쪽에서 시/도를 이미 골랐으므로 목록에는 구 이름만 둔다. 검색 중에는
          결과가 시/도를 가로지르므로 그때만 어디인지 함께 보여준다. */}
      <Text style={[styles.districtName, viewing && styles.districtNameCurrent]}>
        {showSido && <Text style={styles.districtSido}>{region.sido} </Text>}
        {region.district}
      </Text>

      <View style={[styles.check, viewing && styles.checkOn]}>
        {viewing && <Text style={styles.checkGlyph}>✓</Text>}
      </View>
    </Pressable>
  );
}

const useStyles = createStyles((c) => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    // 화면 아래에서 올라오되 위쪽을 남겨 뒤가 비치게 한다
    maxHeight: '85%',
    backgroundColor: c.screen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetBody: {
    paddingHorizontal: AppSpacing.screenPad,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.track,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: c.title,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: c.muted,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    fontSize: 13,
    fontWeight: '700',
    color: c.muted,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: AppRadius.chip,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  searchGlyph: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: c.body,
    padding: 0,
  },
  columns: {
    flexDirection: 'row',
    marginTop: 14,
    height: 400,
  },
  columnHead: {
    fontSize: 10,
    fontWeight: '700',
    color: c.muted,
    paddingBottom: 6,
  },
  sidoColumn: {
    width: 78,
    borderRightWidth: 1,
    borderRightColor: c.cardBorder,
    paddingRight: 8,
  },
  districtColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  sidoRow: {
    // 높이를 고정해야 현재 시/도 위치를 계산해 스크롤할 수 있다
    height: SIDO_ROW_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 8,
    borderRadius: 8,
  },
  sidoRowCurrent: {
    backgroundColor: c.accentSurface,
    borderLeftWidth: 3,
    borderLeftColor: c.accent,
  },
  sidoName: {
    fontSize: 13,
    fontWeight: '600',
    color: c.body,
  },
  sidoNameCurrent: {
    fontWeight: '800',
    color: c.accentText,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  districtName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: c.body,
  },
  districtNameCurrent: {
    fontWeight: '800',
    color: c.accentText,
  },
  districtSido: {
    // 시/도는 어느 지역인지 알려주는 보조 정보라 구 이름보다 흐리게 둔다
    fontWeight: '600',
    color: c.muted,
  },
  recent: {
    marginTop: 14,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    // 마지막 칩이 오른쪽 끝에 붙지 않게 여유를 준다
    paddingRight: 4,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: AppRadius.chip,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.body,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: c.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    borderColor: c.accent,
    backgroundColor: c.accent,
  },
  checkGlyph: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: c.muted,
  },
  hint: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 15,
    color: c.muted,
  },
  dimmed: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.6,
  },
}));
