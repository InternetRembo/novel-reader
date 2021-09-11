import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableWithoutFeedback,
    Dimensions,
    Pressable,
} from "react-native";

import { useDispatch } from "react-redux";
import { IconButton, Portal } from "react-native-paper";
import Tts from "react-native-tts";
import changeNavigationBarColor, {
    hideNavigationBar,
    showNavigationBar,
} from "react-native-navigation-bar-color";
import WebView from "react-native-webview";

import {
    getChapterFromDB,
    getNextChapterFromDB,
    getPrevChapterFromDB,
} from "../../database/queries/ChapterQueries";
import { fetchChapter } from "../../services/Source/source";
import { showToast } from "../../hooks/showToast";
import {
    usePosition,
    useReaderSettings,
    useSettings,
    useTheme,
    useTrackingStatus,
} from "../../hooks/reduxHooks";
import { updateChaptersRead } from "../../redux/tracker/tracker.actions";
import {
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "./readerStyleController";
import { markChapterReadAction } from "../../redux/novel/novel.actions";
import { saveScrollPosition } from "../../redux/preferences/preference.actions";
import { parseChapterNumber } from "../../services/updates";

import ChapterAppbar from "./components/ChapterAppbar";
import ReaderSheet from "./components/ReaderSheet";
import EmptyView from "../../components/EmptyView";

import ChapterFooter from "./components/ChapterFooter";
import VerticalScrollbar from "./components/VerticalScrollbar";
import GestureRecognizer from "react-native-swipe-gestures";
import { LoadingScreen } from "../../components/LoadingScreen/LoadingScreen";
import { insertHistory } from "../../database/queries/HistoryQueries";
import { SET_LAST_READ } from "../../redux/preferences/preference.types";
import { htmlToText } from "../../sources/helpers/htmlToText";
import { setAppSettings } from "../../redux/settings/settings.actions";
import { cleanHtml } from "../../sources/helpers/cleanHtml";
import { useBatteryLevel } from "react-native-device-info";
import moment from "moment";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Chapter = ({ route, navigation }) => {
    const {
        sourceId,
        chapterId,
        chapterUrl,
        novelId,
        novelUrl,
        novelName,
        chapterName,
        bookmark,
    } = route.params;

    let scrollViewRef = useRef(null);
    let readerSheetRef = useRef(null);

    const theme = useTheme();
    const dispatch = useDispatch();
    const reader = useReaderSettings();
    const insets = useSafeAreaInsets();

    const {
        showScrollPercentage = true,
        fullScreenMode = true,
        swipeGestures = true,
        incognitoMode = false,
        textSelectable = false,
        useWebViewForChapter = false,
        showBatteryAndTime = false,
        autoScroll = false,
        autoScrollInterval = 10,
    } = useSettings();

    const batteryLevel = useBatteryLevel();

    const [hidden, setHidden] = useState(true);

    const { tracker, trackedNovels } = useTrackingStatus();
    const position = usePosition(novelId, chapterId);

    const isTracked = trackedNovels.find((obj) => obj.novelId === novelId);

    const [chapter, setChapter] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [firstLayout, setFirstLayout] = useState(true);

    const [contentSize, setContentSize] = useState(0);

    const [textToSpeech, setTextToSpeech] = useState();

    useEffect(() => {
        Tts.addEventListener("tts-start", () => setTextToSpeech("start"));
        Tts.addEventListener("tts-progress", (event) =>
            setTextToSpeech("progress")
        );
        Tts.addEventListener("tts-finish", () => setTextToSpeech("finish"));
        Tts.addEventListener("tts-cancel", () => setTextToSpeech("cancel"));

        return () => Tts.stop();
    }, []);

    const tts = () => {
        if (!loading) {
            if (textToSpeech === "progress") {
                Tts.stop();
                return;
            }

            const text = htmlToText(chapter.chapterText);

            if (text.length >= 3999) {
                const splitNChars = (txt, num) => {
                    let result = [];
                    for (let i = 0; i < txt.length; i += num) {
                        result.push(txt.substr(i, num));
                    }
                    return result;
                };

                let splitMe = splitNChars(text, 3999);

                splitMe.forEach((value, key) => {
                    Tts.speak(value, {
                        androidParams: {
                            KEY_PARAM_STREAM: "STREAM_MUSIC",
                        },
                    });
                });
            } else {
                Tts.stop();
                Tts.speak(escaped, {
                    androidParams: {
                        KEY_PARAM_STREAM: "STREAM_MUSIC",
                    },
                });
            }
        }
    };

    const getChapter = async (chapterId) => {
        try {
            if (chapterId) {
                const chapterDownloaded = await getChapterFromDB(chapterId);

                if (chapterDownloaded) {
                    setChapter(chapterDownloaded);
                } else {
                    const res = await fetchChapter(
                        sourceId,
                        novelUrl,
                        chapterUrl
                    );
                    setChapter(res);
                }
            } else {
                const res = await fetchChapter(sourceId, novelUrl, chapterUrl);

                setChapter(res);
            }

            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
            showToast(error.message);
        }
    };

    const [nextChapter, setNextChapter] = useState({});
    const [prevChapter, setPrevChapter] = useState({});

    const setPrevAndNextChap = async () => {
        const nextChap = await getNextChapterFromDB(novelId, chapterId);
        const prevChap = await getPrevChapterFromDB(novelId, chapterId);

        setNextChapter(nextChap);
        setPrevChapter(prevChap);
    };

    useEffect(() => {
        setImmersiveMode();
        getChapter(chapterId);

        if (!incognitoMode) {
            insertHistory(novelId, chapterId);
            dispatch({
                type: SET_LAST_READ,
                payload: { novelId, chapterId },
            });
        }
    }, []);

    useEffect(() => {
        navigation.addListener("beforeRemove", (e) => {
            StatusBar.setHidden(false);
            showNavigationBar();
        });
    }, []);

    useEffect(() => {
        setPrevAndNextChap();
    }, [chapter]);

    const [currentTime, setCurrentTime] = useState();

    useEffect(() => {
        setInterval(() => {
            setCurrentTime(new Date().toISOString());
        }, 60000);
    }, []);

    const [currentOffset, setCurrentOffset] = useState(position?.position || 0);

    let scrollTimeout;

    useEffect(() => {
        if (!useWebViewForChapter && scrollPercentage !== 100 && autoScroll) {
            scrollTimeout = setTimeout(() => {
                scrollViewRef.current.scrollTo({
                    x: 0,
                    y: currentOffset + Dimensions.get("window").height,
                    animated: true,
                });
                setCurrentOffset(
                    (prevState) => prevState + Dimensions.get("window").height
                );
            }, autoScrollInterval * 1000);
        }

        return () => clearTimeout(scrollTimeout);
    }, [autoScroll, currentOffset]);

    const isCloseToBottom = useCallback(
        ({ layoutMeasurement, contentOffset, contentSize }) => {
            const paddingToBottom = 40;
            return (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
            );
        },
        []
    );

    const updateTracker = () => {
        const chapterNumber = parseChapterNumber(chapterName);

        isTracked &&
            chapterNumber &&
            Number.isInteger(chapterNumber) &&
            chapterNumber > isTracked.my_list_status.num_chapters_read &&
            dispatch(
                updateChaptersRead(
                    isTracked.id,
                    tracker.access_token,
                    chapterNumber
                )
            );
    };

    const onScroll = useCallback(({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        const position =
            nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

        const percentage = Math.round(
            (position / nativeEvent.contentSize.height) * 100
        );
        setScrollPercentage(percentage);

        if (!incognitoMode) {
            dispatch(
                saveScrollPosition(offsetY, percentage, chapterId, novelId)
            );
        }

        if (!incognitoMode && isCloseToBottom(nativeEvent)) {
            dispatch(markChapterReadAction(chapterId, novelId));
            updateTracker();
        }
    }, []);

    const setImmersiveMode = () => {
        if (fullScreenMode) {
            StatusBar.setHidden(true);
            hideNavigationBar();
        } else {
            StatusBar.setBackgroundColor(readerBackground(reader.theme));
            changeNavigationBarColor(readerBackground(reader.theme));
        }
    };

    const scrollToSavedProgress = useCallback((event) => {
        if (position && firstLayout) {
            position.percentage < 100 &&
                scrollViewRef.current.scrollTo({
                    x: 0,
                    y: position.position,
                    animated: false,
                });
            setFirstLayout(false);
        }
    }, []);

    const hideHeader = () => {
        if (!hidden) {
            setImmersiveMode();
        } else {
            if (fullScreenMode) {
                StatusBar.setHidden(false);
                showNavigationBar();
            }
        }
        setHidden(!hidden);
    };

    const readerStyles = [
        {
            fontSize: reader.textSize,
            color: reader.textColor || readerTextColor(reader.theme),
            lineHeight: readerLineHeight(reader.textSize, reader.lineHeight),
            textAlign: reader.textAlign,
        },
        reader.fontFamily && {
            fontFamily: reader.fontFamily,
        },
    ];

    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
    };

    const navigateToPrevChapter = () =>
        prevChapter
            ? navigation.replace("Chapter", {
                  chapterUrl: prevChapter.chapterUrl,
                  chapterId: prevChapter.chapterId,
                  sourceId,
                  novelUrl,
                  novelId,
                  chapterName: prevChapter.chapterName,
                  novelName,
                  bookmark: prevChapter.bookmark,
              })
            : showToast("There's no previous chapter");

    const navigateToNextChapter = () =>
        nextChapter
            ? navigation.replace("Chapter", {
                  chapterUrl: nextChapter.chapterUrl,
                  sourceId,
                  novelUrl,
                  novelId,
                  chapterId: nextChapter.chapterId,
                  chapterName: nextChapter.chapterName,
                  novelName,
                  bookmark: nextChapter.bookmark,
              })
            : showToast("There's no next chapter");

    const enableSwipeGestures = () => {
        dispatch(setAppSettings("swipeGestures", !swipeGestures));
        showToast(
            swipeGestures ? "Swipe gestures disabled" : "Swipe gestured enabled"
        );
    };

    const enableAutoScroll = () =>
        dispatch(setAppSettings("autoScroll", !autoScroll));

    const enableWebView = () =>
        dispatch(setAppSettings("useWebViewForChapter", !useWebViewForChapter));

    return (
        <>
            <>
                <ChapterAppbar
                    novelName={novelName}
                    chapterName={chapterName}
                    chapterId={chapterId}
                    bookmark={bookmark}
                    textToSpeech={textToSpeech}
                    tts={tts}
                    readerSheetRef={readerSheetRef}
                    hide={hidden}
                    navigation={navigation}
                    dispatch={dispatch}
                    theme={theme}
                />
                <GestureRecognizer
                    onSwipeRight={swipeGestures && navigateToPrevChapter}
                    onSwipeLeft={swipeGestures && navigateToNextChapter}
                    config={config}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        ref={(ref) => (scrollViewRef.current = ref)}
                        contentContainerStyle={[
                            styles.screenContainer,
                            { backgroundColor: readerBackground(reader.theme) },
                        ]}
                        onScroll={onScroll}
                        onContentSizeChange={(x, y) => setContentSize(y)}
                        showsVerticalScrollIndicator={false}
                    >
                        {error ? (
                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <EmptyView
                                    icon="Σ(ಠ_ಠ)"
                                    description={error}
                                    style={{
                                        color:
                                            reader.textColor ||
                                            readerTextColor(reader.theme),
                                    }}
                                >
                                    <IconButton
                                        icon="reload"
                                        size={25}
                                        style={{ margin: 0, marginTop: 16 }}
                                        color={
                                            reader.textColor ||
                                            readerTextColor(reader.theme)
                                        }
                                        onPress={() => {
                                            getChapter(chapterId);
                                            setLoading(true);
                                            setError();
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color:
                                                reader.textColor ||
                                                readerTextColor(reader.theme),
                                        }}
                                    >
                                        Retry
                                    </Text>
                                </EmptyView>
                            </View>
                        ) : loading ? (
                            <LoadingScreen theme={theme} />
                        ) : (
                            <TouchableWithoutFeedback
                                style={{ flex: 1 }}
                                onPress={hideHeader}
                                onLayout={scrollToSavedProgress}
                            >
                                {useWebViewForChapter ? (
                                    <WebView
                                        style={{
                                            backgroundColor: readerBackground(
                                                reader.theme
                                            ),
                                        }}
                                        originWhitelist={["*"]}
                                        scalesPageToFit={true}
                                        showsVerticalScrollIndicator={false}
                                        onScroll={onScroll}
                                        onNavigationStateChange={async ({
                                            url,
                                        }) => {
                                            if (
                                                (sourceId === 50 ||
                                                    sourceId == 62) &&
                                                url !== "about:blank"
                                            ) {
                                                setLoading(true);
                                                const res = await fetchChapter(
                                                    sourceId,
                                                    novelUrl,
                                                    url
                                                );
                                                setChapter(res);
                                                setLoading(false);
                                            }
                                        }}
                                        source={{
                                            html: `
                            <html>
                            <head>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                                <style>
                                html {
                                    overflow-x: hidden;
                                    padding-top: ${StatusBar.currentHeight};
                                    word-wrap: break-word;
                                }
                                body {
                                    padding-left: ${reader.padding}%;
                                    padding-right: ${reader.padding}%;
                                    padding-bottom: 30px;
                                    font-size: ${reader.textSize}px;
                                    color: ${reader.textColor};

                                    text-align: ${reader.textAlign};
                                    line-height: ${reader.lineHeight};
                                    font-family: ${reader.fontFamily};
                                }
                                hr {
                                    margin-top: 20px;
                                    margin-bottom: 20px;
                                }
                                a {
                                    color: ${theme.colorAccent};
                                }
                                img {
                                    display: block;
                                    width: auto;
                                    height: auto;
                                    max-width: 100%;
                                }
                                </style>
                                <style>
                                ${reader.customCSS}
                                @font-face {
                                    font-family: ${reader.fontFamily};
                                    src: url("file:///android_asset/fonts/${
                                        reader.fontFamily
                                    }.ttf");
                                }
                                
                                </style>
                                </head>
                            <body>
                                ${cleanHtml(chapter.chapterText)}
                            </body>
                            </html>
                            `,
                                        }}
                                        onScroll={onScroll}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingVertical: 16,
                                            paddingHorizontal: `${reader.padding}%`,
                                            paddingTop: StatusBar.currentHeight,
                                        }}
                                    >
                                        <Text
                                            style={readerStyles}
                                            selectable={textSelectable}
                                        >
                                            {htmlToText(chapter.chapterText)}
                                        </Text>
                                        {nextChapter && (
                                            <View
                                                style={{
                                                    marginTop: 32,
                                                    marginBottom: 16,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: reader.textColor,
                                                        fontSize: 16,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Finished: {chapterName}
                                                </Text>
                                                <View
                                                    style={{
                                                        borderRadius: 8,
                                                        marginVertical: 4,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <Pressable
                                                        style={{
                                                            paddingHorizontal: 16,
                                                            paddingVertical: 8,
                                                        }}
                                                        android_ripple={{
                                                            color: theme.rippleColor,
                                                        }}
                                                        onPress={
                                                            navigateToNextChapter
                                                        }
                                                    >
                                                        <Text
                                                            style={{
                                                                color: reader.textColor,
                                                                fontSize: 16,
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            Next:{" "}
                                                            {
                                                                nextChapter.chapterName
                                                            }
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableWithoutFeedback>
                        )}
                    </ScrollView>
                </GestureRecognizer>

                <Portal>
                    <ReaderSheet
                        theme={theme}
                        reader={reader}
                        dispatch={dispatch}
                        navigation={navigation}
                        bottomSheetRef={readerSheetRef}
                        selectText={textSelectable}
                        autoScroll={autoScroll}
                        useWebViewForChapter={useWebViewForChapter}
                        showScrollPercentage={showScrollPercentage}
                        showBatteryAndTime={showBatteryAndTime}
                        fullScreenMode={fullScreenMode}
                    />
                </Portal>
                {!useWebViewForChapter && (
                    <VerticalScrollbar
                        theme={theme}
                        hide={hidden}
                        setLoading={setLoading}
                        contentSize={contentSize}
                        scrollViewRef={scrollViewRef}
                        scrollPercentage={scrollPercentage}
                        setScrollPercentage={setScrollPercentage}
                    />
                )}
                <ChapterFooter
                    theme={theme}
                    swipeGestures={swipeGestures}
                    enableSwipeGestures={enableSwipeGestures}
                    enableWebView={enableWebView}
                    dispatch={dispatch}
                    nextChapter={nextChapter}
                    prevChapter={prevChapter}
                    hide={hidden}
                    autoScroll={autoScroll}
                    useWebViewForChapter={useWebViewForChapter}
                    navigateToNextChapter={navigateToNextChapter}
                    navigateToPrevChapter={navigateToPrevChapter}
                    readerSheetRef={readerSheetRef}
                    scrollViewRef={scrollViewRef}
                    enableAutoScroll={enableAutoScroll}
                />
                {(showScrollPercentage || showBatteryAndTime) && (
                    <View
                        style={[
                            styles.scrollPercentageContainer,
                            { backgroundColor: readerBackground(reader.theme) },
                            !fullScreenMode && {
                                paddingBottom: insets.bottom,
                            },
                        ]}
                    >
                        {showBatteryAndTime && (
                            <Text style={{ color: reader.textColor }}>
                                {Math.ceil(batteryLevel * 100) + "%"}
                            </Text>
                        )}
                        {showScrollPercentage && (
                            <Text
                                style={{
                                    flex: 1,
                                    color: reader.textColor,
                                    textAlign: "center",
                                }}
                            >
                                {scrollPercentage + "%"}
                            </Text>
                        )}
                        {showBatteryAndTime && (
                            <Text style={{ color: reader.textColor }}>
                                {moment(currentTime).format("h:mm")}
                            </Text>
                        )}
                    </View>
                )}
            </>
        </>
    );
};

export default Chapter;

const styles = StyleSheet.create({
    screenContainer: { flexGrow: 1 },
    scrollPercentageContainer: {
        width: "100%",
        position: "absolute",
        paddingVertical: 4,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        flexDirection: "row",
        paddingHorizontal: 32,
        alignItems: "center",
        justifyContent: "space-between",
    },
});
