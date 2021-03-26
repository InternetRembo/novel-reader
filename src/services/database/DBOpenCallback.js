import * as SQLite from "expo-sqlite";
import {
    createNovelTableQuery,
    createUrlIndexQuery,
    createLibraryIndexQuery,
} from "./tables/NovelTable";
import {
    createChapterTableQuery,
    createNovelIdIndexQuery,
    createUnreadChaptersIndexQuery,
} from "./tables/ChapterTable";
import {
    createHistoryTableQuery,
    createChapterIdIndexQuery,
} from "./tables/HistoryTable";
import { createDownloadTableQuery } from "./tables/DownloadTable";

/**
 * Database Version = 2
 */

const dbName = "lnreader.db";

const db = SQLite.openDatabase(dbName);

export const createDB = () => {
    db.transaction((tx) => {
        tx.executeSql(createNovelTableQuery);
        tx.executeSql(createChapterTableQuery);
        tx.executeSql(createHistoryTableQuery);
        tx.executeSql(createDownloadTableQuery);

        //Db indexes
        tx.executeSql(createUrlIndexQuery);
        tx.executeSql(createLibraryIndexQuery);
        tx.executeSql(createNovelIdIndexQuery);
        tx.executeSql(createUnreadChaptersIndexQuery);
        tx.executeSql(createChapterIdIndexQuery);
    });
};
