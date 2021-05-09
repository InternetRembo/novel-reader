import { ToastAndroid } from "react-native";

import {
    LOADING_NOVEL,
    GET_NOVEL,
    GET_CHAPTERS,
    FETCHING_NOVEL,
    SET_NOVEL,
    UPDATE_IN_LIBRARY,
    CHAPTER_READ,
    CHAPTER_DOWNLOADING,
    CHAPTER_DOWNLOADED,
    CHAPTER_DELETED,
    UPDATE_NOVEL,
    SET_NOVEL_SETTINGS,
} from "./novel.types";

import { updateNovel } from "../../Services/updates";
import { fetchNovel } from "../../Services/Source/source";
import {
    followNovel,
    insertNovel,
    getNovel,
} from "../../Database/queries/NovelQueries";
import {
    getChapters,
    insertChapters,
    markChapterRead,
    downloadChapter,
    deleteChapter,
} from "../../Database/queries/ChapterQueries";
import { deleteNovelUpdates } from "../../Database/queries/UpdateQueries";
import {
    SET_CHAPTER_LIST_PREF,
    SET_LAST_READ,
} from "../preferences/preference.types";
import { GET_LIBRARY_NOVELS } from "../library/library.types";
import { getLibrary } from "../../Database/queries/LibraryQueries";

export const setNovel = (novel) => async (dispatch) => {
    dispatch({ type: SET_NOVEL, payload: novel });
};

export const getNovelAction = (
    followed,
    sourceId,
    novelUrl,
    novelId,
    sort,
    filter
) => async (dispatch) => {
    dispatch({ type: LOADING_NOVEL });

    if (followed === 1) {
        const chapters = await getChapters(novelId, sort, filter);

        dispatch({
            type: GET_CHAPTERS,
            payload: chapters,
        });
    } else {
        dispatch({ type: FETCHING_NOVEL });

        const novel = await getNovel(sourceId, novelUrl);

        if (novel) {
            novel.chapters = await getChapters(novel.novelId, sort, filter);
            dispatch({
                type: GET_NOVEL,
                payload: novel,
            });
        } else {
            const fetchedNovel = await fetchNovel(sourceId, novelUrl);

            const fetchedNovelId = await insertNovel(fetchedNovel);
            await insertChapters(fetchedNovelId, fetchedNovel.chapters);

            const novel = await getNovel(sourceId, novelUrl);
            novel.chapters = await getChapters(novel.novelId);

            dispatch({
                type: GET_NOVEL,
                payload: novel,
            });
        }
    }
};

export const sortAndFilterChapters = (novelId, sort, filter) => async (
    dispatch
) => {
    const chapters = await getChapters(novelId, sort, filter);

    dispatch({
        type: GET_CHAPTERS,
        payload: chapters,
    });

    dispatch({
        type: SET_CHAPTER_LIST_PREF,
        payload: { novelId, sort, filter },
    });
};

export const followNovelAction = (novel) => async (dispatch) => {
    await followNovel(novel.followed, novel.novelId);

    if (!novel.followNovel) {
        deleteNovelUpdates(novel.novelId);
    }

    dispatch({
        type: UPDATE_IN_LIBRARY,
        payload: { novelUrl: novel.novelUrl, followed: !novel.followed },
    });

    const res = await getLibrary();

    dispatch({
        type: GET_LIBRARY_NOVELS,
        payload: res,
    });

    ToastAndroid.show(
        !novel.followed ? "Added to library" : "Removed from library",
        ToastAndroid.SHORT
    );
};

export const markChapterReadAction = (chapterId, novelId) => async (
    dispatch
) => {
    await markChapterRead(chapterId);
    dispatch({ type: CHAPTER_READ, payload: { chapterId } });
    dispatch({
        type: SET_LAST_READ,
        payload: { novelId, chapterId: chapterId + 1 },
    });
};

export const downloadChapterAction = (
    extensionId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterId
) => async (dispatch) => {
    dispatch({
        type: CHAPTER_DOWNLOADING,
        payload: chapterId,
    });

    await downloadChapter(extensionId, novelUrl, chapterUrl, chapterId);

    dispatch({
        type: CHAPTER_DOWNLOADED,
        payload: chapterId,
    });

    ToastAndroid.show(`Downloaded ${chapterName}`, ToastAndroid.SHORT);
};

export const downloadAllChaptersAction = (
    extensionId,
    novelUrl,
    chapters
) => async (dispatch) => {
    await chapters.map((chapter, index) => {
        setTimeout(async () => {
            dispatch({
                type: CHAPTER_DOWNLOADING,
                payload: chapter.chapterId,
            });

            if (!chapter.downloaded) {
                await downloadChapter(
                    extensionId,
                    novelUrl,
                    chapter.chapterUrl,
                    chapter.chapterId
                );
            }

            dispatch({
                type: CHAPTER_DOWNLOADED,
                payload: chapter.chapterId,
            });
        }, 1000 * index);
    });

    ToastAndroid.show(`All chapters downloaded`, ToastAndroid.SHORT);
};

export const deleteChapterAction = (chapterId, chapterName) => async (
    dispatch
) => {
    await deleteChapter(chapterId);

    dispatch({
        type: CHAPTER_DELETED,
        payload: chapterId,
    });

    ToastAndroid.show(`Deleted ${chapterName}`, ToastAndroid.SHORT);
};

export const deleteAllChaptersAction = (chapters) => async (dispatch) => {
    await chapters.map((chapter) => {
        deleteChapter(chapter.chapterId);

        dispatch({
            type: CHAPTER_DELETED,
            payload: chapter.chapterId,
        });
    });

    ToastAndroid.show(`Deleted all chapters`, ToastAndroid.SHORT);
};

export const updateNovelAction = (sourceId, novelUrl, novelId) => async (
    dispatch
) => {
    dispatch({ type: FETCHING_NOVEL });

    await updateNovel(sourceId, novelUrl, novelId);

    let novel = await getNovel(sourceId, novelUrl);
    let chapters = await getChapters(novel.novelId);

    dispatch({
        type: UPDATE_NOVEL,
        payload: { novel, chapters },
    });
};
