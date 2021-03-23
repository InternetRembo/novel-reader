import { ToastAndroid } from "react-native";

import {
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTERS,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_READ,
    GET_CHAPTER,
    CHAPTER_LOADING,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    UPDATE_NOVEL,
} from "./types";
import {
    checkNovelInDb,
    getChaptersFromDb,
    getNovelInfoFromDb,
    insertChaptersInDb,
    insertNovelInfoInDb,
    toggleFavourite,
    downloadChapterFromSource,
    deleteChapterFromDb,
    chapterRead,
    isChapterDownloaded,
    getChapterFromDb,
} from "../../services/db";
import {
    fetchChapterFromSource,
    fetchChaptersFromSource,
    fetchNovelFromSource,
} from "../../services/api";
import { updateNovel } from "../../services/updates";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovel = (inLibrary, extensionId, novelUrl) => async (
    dispatch
) => {
    dispatch({ type: LOADING_NOVEL });

    if (inLibrary === 1) {
        const chapters = await getChaptersFromDb(novelUrl, "", "");
        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });
    } else {
        dispatch({ type: FETCHING_NOVEL });

        const inCache = await checkNovelInDb(novelUrl);

        if (inCache) {
            const novel = await getNovelInfoFromDb(novelUrl);
            const chapters = await getChaptersFromDb(novelUrl, "", "");

            dispatch({
                type: GET_NOVEL,
                payload: { novel, chapters },
            });
        } else {
            const novel = await fetchNovelFromSource(extensionId, novelUrl);

            dispatch({
                type: GET_NOVEL,
                payload: { novel, chapters: novel.novelChapters },
            });

            insertNovelInfoInDb(novel);
            insertChaptersInDb(novelUrl, novel.novelChapters);
        }
    }
};

export const sortAndFilterChapters = (novelUrl, filter, sort) => async (
    dispatch
) => {
    const chapters = await getChaptersFromDb(novelUrl, filter, sort);
    dispatch({
        type: GET_CHAPTERS,
        payload: chapters,
    });
};

export const insertNovelInLibrary = (inLibrary, novelUrl) => async (
    dispatch
) => {
    toggleFavourite(inLibrary, novelUrl);

    dispatch({
        type: UPDATE_IN_LIBRARY,
        payload: !inLibrary,
    });

    ToastAndroid.show(
        !inLibrary ? "Added to library" : "Removed from library",
        ToastAndroid.SHORT
    );
};

export const getChapter = (extensionId, chapterUrl, novelUrl) => async (
    dispatch
) => {
    dispatch({ type: CHAPTER_LOADING });
    const isDownloaded = await isChapterDownloaded(chapterUrl, novelUrl);
    let chapter;

    if (isDownloaded) {
        chapter = await getChapterFromDb(chapterUrl, novelUrl);
    } else {
        chapter = await fetchChapterFromSource(
            extensionId,
            novelUrl,
            chapterUrl
        );
    }
    dispatch({ type: GET_CHAPTER, payload: chapter });
};

export const updateChapterRead = (chapterUrl, novelUrl) => async (dispatch) => {
    await chapterRead(chapterUrl, novelUrl);

    dispatch({ type: CHAPTER_READ, payload: { chapterUrl, novelUrl } });
};

export const downloadChapter = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName
) => async (dispatch) => {
    dispatch({
        type: CHAPTER_DOWNLOADING,
        payload: {
            extensionId,
            novelUrl,
            chapterUrl,
        },
    });

    await downloadChapterFromSource(extensionId, novelUrl, chapterUrl);

    dispatch({
        type: CHAPTER_DOWNLOADED,
        payload: { extensionId, novelUrl, chapterUrl },
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
};

export const deleteChapter = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName
) => async (dispatch) => {
    await deleteChapterFromDb(novelUrl, chapterUrl);

    dispatch({
        type: CHAPTER_DELETED,
        payload: { extensionId, novelUrl, chapterUrl },
    });

    ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
};

export const updateLibraryNovel = (extensionId, novelUrl) => async (
    dispatch
) => {
    dispatch({ type: FETCHING_NOVEL });

    const updatedNovel = await updateNovel(extensionId, novelUrl);

    dispatch({
        type: UPDATE_NOVEL,
        payload: { novel: updatedNovel, chapters: updatedNovel.novelChapters },
    });
};
