import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  Dimensions,
  Share,
  Text,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  Provider,
  Portal,
  Appbar,
  IconButton,
  Menu,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';

import {
  bookmarkChapterAction,
  deleteAllChaptersAction,
  deleteChapterAction,
  downloadAllChaptersAction,
  downloadChapterAction,
  getNovelAction,
  markChaptersRead,
  markChapterUnreadAction,
  markPreviousChaptersReadAction,
  setNovel,
  sortAndFilterChapters,
  updateNovelAction,
} from '../../redux/novel/novel.actions';
import {
  useContinueReading,
  useNovel,
  usePreferences,
  useSettings,
} from '../../hooks/reduxHooks';
import { showToast } from '../../hooks/showToast';
import { useTheme } from '@hooks/useTheme';
import ChapterItem from './components/ChapterItem';
import NovelInfoHeader from './components/Info/NovelInfoHeader';
import NovelBottomSheet from './components/NovelBottomSheet';
import TrackSheet from './components/Tracker/TrackSheet';
import { Row } from '../../components/Common';
import JumpToChapterModal from './components/JumpToChapterModal';
import { Actionbar } from '../../components/Actionbar/Actionbar';
import EditInfoModal from './components/EditInfoModal';
import { pickCustomNovelCover } from '../../database/queries/NovelQueries';
import DownloadCustomChapterModal from './components/DownloadCustomChapterModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useBoolean from '@hooks/useBoolean';
import { useCategorySettings } from '@hooks/useSettings';
import { openChapter } from '../../utils/handleNavigateParams';
import NovelScreenLoading from './components/LoadingAnimation/NovelScreenLoading';

const Novel = ({ route, navigation }) => {
  const item = route.params;
  const { sourceId, novelUrl, novelName, followed, novelId } = item;

  const theme = useTheme();
  const dispatch = useDispatch();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const progressViewOffset = topInset + 32;

  const { novel, chapters, loading, updating } = useNovel();
  const { downloadQueue } = useSelector(state => state.downloadsReducer);

  const [selected, setSelected] = useState([]);
  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);

  let flatlistRef = useRef(null);
  let novelBottomSheetRef = useRef(null);
  let trackerSheetRef = useRef(null);

  const deleteDownloadsSnackbar = useBoolean();

  const {
    useFabForContinueReading = false,
    defaultChapterSort = 'ORDER BY chapterId ASC',
    disableHapticFeedback = false,
  } = useSettings();

  const {
    sort = defaultChapterSort,
    filter = '',
    showChapterTitles = false,
  } = usePreferences(novel.novelId);

  let { lastReadChapter, position } = useContinueReading(
    chapters,
    novel.novelId,
  );

  const { defaultCategoryId = 1 } = useCategorySettings();

  useEffect(() => {
    dispatch(
      getNovelAction(
        followed,
        sourceId,
        novelUrl,
        novelId,
        sort,
        filter,
        defaultCategoryId,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getNovelAction]);

  const onRefresh = () => {
    dispatch(updateNovelAction(sourceId, novelUrl, novelId, sort, filter));
    showToast(`Updated ${novelName}`);
  };

  const refreshControl = () => (
    <RefreshControl
      progressViewOffset={progressViewOffset}
      onRefresh={onRefresh}
      refreshing={updating}
      colors={[theme.primary]}
      progressBackgroundColor={theme.onPrimary}
    />
  );

  const [jumpToChapterModal, showJumpToChapterModal] = useState(false);

  const downloadChapter = chapter =>
    dispatch(
      downloadChapterAction(
        sourceId,
        novelUrl,
        novelId,
        chapter.chapterUrl,
        chapter.chapterName,
        chapter.chapterId,
      ),
    );

  const actions = useMemo(() => {
    const list = [];

    if (selected.some(obj => obj.downloaded === 0)) {
      list.push({
        icon: 'download-outline',
        onPress: () => {
          dispatch(
            downloadAllChaptersAction(novel.sourceId, novel.novelUrl, selected),
          );
          setSelected([]);
        },
      });
    }
    if (selected.some(obj => obj.downloaded === 1)) {
      list.push({
        icon: 'trash-can-outline',
        onPress: () => {
          dispatch(deleteAllChaptersAction(sourceId, selected));
          setSelected([]);
        },
      });
    }

    list.push({
      icon: 'bookmark-outline',
      onPress: () => {
        dispatch(bookmarkChapterAction(selected));
        setSelected([]);
      },
    });

    if (selected.some(obj => obj.read === 0)) {
      list.push({
        icon: 'check',
        onPress: () => {
          dispatch(markChaptersRead(selected, novel.novelId, sort, filter));
          setSelected([]);
        },
      });
    }

    if (selected.some(obj => obj.read === 1)) {
      list.push({
        icon: 'check-outline',
        onPress: () => {
          dispatch(
            markChapterUnreadAction(selected, novel.novelId, sort, filter),
          );
          setSelected([]);
        },
      });
    }

    if (selected.length === 1) {
      list.push({
        icon: 'playlist-check',
        onPress: () => {
          dispatch(
            markPreviousChaptersReadAction(
              selected[0].chapterId,
              selected[0].novelId,
            ),
          );
          setSelected([]);
        },
      });
    }

    return list;
  }, [selected]);

  const deleteChapter = chapter =>
    dispatch(
      deleteChapterAction(
        sourceId,
        novelId,
        chapter.chapterId,
        chapter.chapterName,
      ),
    );

  const isSelected = chapterId => {
    return selected.some(obj => obj.chapterId === chapterId);
  };

  const onSelectPress = (chapter, navigateToChapter) => {
    if (selected.length === 0) {
      navigateToChapter();
    } else {
      if (isSelected(chapter.chapterId)) {
        setSelected(sel =>
          sel.filter(it => it.chapterId !== chapter.chapterId),
        );
      } else {
        setSelected(sel => [...sel, chapter]);
      }
    }
  };

  const onSelectLongPress = chapter => {
    if (selected.length === 0) {
      if (!disableHapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setSelected(sel => [...sel, chapter]);
    } else {
      if (selected.length === chapters.length) {
        return;
      }

      /**
       * Select custom range
       */
      const lastSelectedChapter = selected[selected.length - 1];

      if (lastSelectedChapter.chapterId !== chapter.chapterId) {
        if (lastSelectedChapter.chapterId > chapter.chapterId) {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              chap =>
                (chap.chapterId <= chapter.chapterId ||
                  chap.chapterId >= lastSelectedChapter.chapterId) === false,
            ),
          ]);
        } else {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              chap =>
                (chap.chapterId >= chapter.chapterId ||
                  chap.chapterId <= lastSelectedChapter.chapterId) === false,
            ),
          ]);
        }
      }
    }
  };

  const navigateToChapter = chapter => {
    navigation.navigate(
      'Chapter',
      openChapter({ sourceId, novelUrl, novelName }, chapter),
    );
  };

  const showProgressPercentage = chapter => {
    const savedProgress =
      position &&
      position[chapter.chapterId] &&
      position[chapter.chapterId].percentage;
    if (savedProgress < 100 && savedProgress > 0 && !chapter.read) {
      return (
        <Text
          style={{
            color: theme.outline,
            fontSize: 12,
            marginLeft: chapter.releaseDate ? 5 : 0,
          }}
          numberOfLines={1}
        >
          {chapter.releaseDate ? '•  ' : null}
          {'Progress ' + position[chapter.chapterId].percentage + '%'}
        </Text>
      );
    }
  };

  const setCustomNovelCover = async () => {
    const cover = await pickCustomNovelCover(novelId);

    if (cover) {
      dispatch(
        setNovel({
          ...novel,
          novelCover: cover,
        }),
      );
    }

    showExtraMenu(false);
  };

  const renderItem = ({ item: it, index }) => (
    <ChapterItem
      theme={theme}
      chapter={it}
      index={index}
      showChapterTitles={showChapterTitles}
      downloadQueue={downloadQueue}
      deleteChapter={deleteChapter}
      downloadChapter={downloadChapter}
      isSelected={isSelected}
      onSelectPress={onSelectPress}
      onSelectLongPress={onSelectLongPress}
      navigateToChapter={navigateToChapter}
      showProgressPercentage={showProgressPercentage}
    />
  );

  const [editInfoModal, showEditInfoModal] = useState(false);
  const downloadCustomChapterModal = useBoolean();

  return (
    <Provider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {loading && <NovelScreenLoading theme={theme} />}
        {selected.length === 0 && (
          <View
            style={{
              position: 'absolute',
              zIndex: 1,
              height: StatusBar.currentHeight + 54,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              icon="arrow-left"
              iconColor={theme.onBackground}
              size={24}
              style={{ marginTop: StatusBar.currentHeight + 8 }}
              onPress={() => navigation.goBack()}
            />
            <Row>
              <IconButton
                icon="share-variant"
                iconColor={theme.onBackground}
                size={21}
                style={{
                  marginTop: StatusBar.currentHeight + 8,
                }}
                onPress={() =>
                  Share.share({
                    message: novel.sourceUrl,
                  })
                }
              />
              <IconButton
                icon="text-box-search-outline"
                iconColor={theme.onBackground}
                size={21}
                style={{
                  marginTop: StatusBar.currentHeight + 8,
                }}
                onPress={() => showJumpToChapterModal(true)}
              />

              <Menu
                visible={downloadMenu}
                onDismiss={() => showDownloadMenu(false)}
                anchor={
                  <IconButton
                    icon="download-outline"
                    iconColor={theme.onBackground}
                    size={24}
                    style={{
                      marginTop: StatusBar.currentHeight + 8,
                    }}
                    onPress={() => showDownloadMenu(true)}
                  />
                }
                contentStyle={{ backgroundColor: theme.surface2 }}
              >
                <Menu.Item
                  title="Next chapter"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{ color: theme.onSurface }}
                  onPress={() => {
                    dispatch(
                      downloadAllChaptersAction(
                        novel.sourceId,
                        novel.novelUrl,
                        [
                          chapters.find(
                            chapter =>
                              !!chapter.read === false &&
                              !!chapter.downloaded === false,
                          ),
                        ],
                      ),
                    );
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="Next 5 chapter"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() => {
                    dispatch(
                      downloadAllChaptersAction(
                        novel.sourceId,
                        novel.novelUrl,
                        chapters
                          .filter(
                            chapter =>
                              !!chapter.read === false &&
                              !!chapter.downloaded === false,
                          )
                          .slice(0, 5),
                      ),
                    );
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="Next 10 chapter"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() => {
                    dispatch(
                      downloadAllChaptersAction(
                        novel.sourceId,
                        novel.novelUrl,
                        chapters
                          .filter(
                            chapter =>
                              !!chapter.read === false &&
                              !!chapter.downloaded === false,
                          )
                          .slice(0, 10),
                      ),
                    );
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="Custom"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{ color: theme.onSurface }}
                  onPress={() => {
                    downloadCustomChapterModal.setTrue();
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="Unread"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() => {
                    dispatch(
                      downloadAllChaptersAction(
                        novel.sourceId,
                        novel.novelUrl,
                        chapters.filter(chapter => !!chapter.read === false),
                      ),
                    );
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="All"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() => {
                    dispatch(
                      downloadAllChaptersAction(
                        novel.sourceId,
                        novel.novelUrl,
                        chapters,
                      ),
                    );
                    showDownloadMenu(false);
                  }}
                />
                <Menu.Item
                  title="Delete downloads"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() =>
                    dispatch(deleteAllChaptersAction(sourceId, chapters))
                  }
                />
              </Menu>

              <Menu
                visible={extraMenu}
                onDismiss={() => showExtraMenu(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    iconColor={theme.onBackground}
                    size={21}
                    style={{
                      marginTop: StatusBar.currentHeight + 8,
                      marginRight: 16,
                    }}
                    onPress={() => showExtraMenu(true)}
                  />
                }
                contentStyle={{
                  backgroundColor: theme.surface2,
                }}
              >
                <Menu.Item
                  title="Edit info"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={() => {
                    showEditInfoModal(true);
                    showExtraMenu(false);
                  }}
                />
                <Menu.Item
                  title="Edit cover"
                  style={{ backgroundColor: theme.surface2 }}
                  titleStyle={{
                    color: theme.onSurface,
                  }}
                  onPress={setCustomNovelCover}
                />
              </Menu>
            </Row>
          </View>
        )}
        <View style={{ minHeight: 3, flex: 1 }}>
          <FlashList
            ref={ref => (flatlistRef.current = ref)}
            estimatedItemSize={64}
            data={!loading && chapters}
            extraData={[downloadQueue, selected]}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={15}
            initialNumToRender={7}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'chapter' + index}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={
              <NovelInfoHeader
                item={item}
                novel={novel}
                theme={theme}
                filter={filter}
                loading={loading}
                lastRead={lastReadChapter}
                setCustomNovelCover={setCustomNovelCover}
                dispatch={dispatch}
                chapters={chapters}
                navigation={navigation}
                trackerSheetRef={trackerSheetRef}
                novelBottomSheetRef={novelBottomSheetRef}
                deleteDownloadsSnackbar={deleteDownloadsSnackbar}
              />
            }
            refreshControl={refreshControl()}
          />
        </View>
        {useFabForContinueReading &&
          !loading &&
          chapters.length > 0 &&
          lastReadChapter && (
            <FAB
              style={[
                styles.fab,
                { backgroundColor: theme.primary, marginBottom: bottomInset },
              ]}
              small
              color={theme.onPrimary}
              uppercase={false}
              label={novel.unread ? 'Start' : 'Resume'}
              icon="play"
              onPress={() => {
                navigation.navigate(
                  'Chapter',
                  openChapter(novel, lastReadChapter),
                );
              }}
            />
          )}
        <Portal>
          <Actionbar
            active={selected.length > 0}
            theme={theme}
            style={{ marginBottom: 24 }}
            actions={actions}
          />
          <Snackbar
            visible={deleteDownloadsSnackbar.value}
            onDismiss={deleteDownloadsSnackbar.setFalse}
            action={{
              label: 'Delete',
              onPress: () => {
                dispatch(deleteAllChaptersAction(sourceId, chapters));
              },
            }}
            theme={{ colors: { primary: theme.primary } }}
            style={{ backgroundColor: theme.surface, marginBottom: 32 }}
          >
            <Text style={{ color: theme.onSurface }}>
              Delete downloaded chapters?
            </Text>
          </Snackbar>
        </Portal>
        {!loading && (
          <Portal>
            <JumpToChapterModal
              modalVisible={jumpToChapterModal}
              hideModal={() => showJumpToChapterModal(false)}
              chapters={chapters}
              novel={novel}
              chapterListRef={flatlistRef.current}
              navigation={navigation}
            />
            <EditInfoModal
              modalVisible={editInfoModal}
              hideModal={() => showEditInfoModal(false)}
              novel={novel}
              theme={theme}
              dispatch={dispatch}
            />
            <DownloadCustomChapterModal
              modalVisible={downloadCustomChapterModal.value}
              hideModal={downloadCustomChapterModal.setFalse}
              novel={novel}
              chapters={chapters}
              theme={theme}
              dispatch={dispatch}
            />
            <NovelBottomSheet
              novelUrl={novelUrl}
              bottomSheetRef={novelBottomSheetRef}
              dispatch={dispatch}
              sortAndFilterChapters={sortAndFilterChapters}
              novelId={novel.novelId}
              sort={sort}
              theme={theme}
              filter={filter}
              showChapterTitles={showChapterTitles}
            />
            <TrackSheet
              bottomSheetRef={trackerSheetRef}
              novelId={novel.novelId}
              novelName={novel.novelName}
              theme={theme}
            />
          </Portal>
        )}
        {selected.length > 0 ? (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={{
              position: 'absolute',
              zIndex: 20,
              width: Dimensions.get('window').width,
              elevation: 2,
              backgroundColor: theme.surface2,
              paddingTop: StatusBar.currentHeight,
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 8,
            }}
          >
            <Appbar.Action
              icon="close"
              iconColor={theme.onBackground}
              onPress={() => setSelected([])}
            />
            <Appbar.Content
              title={`${selected.length}`}
              titleStyle={{ color: theme.onSurface }}
            />
            <Appbar.Action
              icon="select-all"
              iconColor={theme.onBackground}
              onPress={() => {
                setSelected(chapters);
              }}
            />
          </Animated.View>
        ) : null}
      </View>
    </Provider>
  );
};

export default Novel;

const styles = StyleSheet.create({
  container: { flex: 1 },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});
