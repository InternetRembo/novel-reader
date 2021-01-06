import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";

import { CustomAppbar } from "../../components/Appbar";
import HistoryCard from "../../components/HistoryCard";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { useSelector } from "react-redux";

const History = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState();

    const theme = useSelector((state) => state.themeReducer.theme);

    const getHistory = () => {
        setLoading(true);
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT HistoryTable.chapterUrl, HistoryTable.historyId, HistoryTable.chapterName, HistoryTable.lastRead, LibraryTable.novelName, LibraryTable.novelCover, LibraryTable.novelUrl, LibraryTable.extensionId, LibraryTable.libraryStatus FROM HistoryTable INNER JOIN LibraryTable ON HistoryTable.novelUrl = LibraryTable.novelUrl ORDER BY HistoryTable.lastRead DESC",
                null,
                (txObj, { rows: { _array } }) => {
                    setHistory(_array);
                    setLoading(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const deleteHistory = (novelId) => {
        db.transaction((tx) => {
            tx.executeSql(
                "DELETE FROM HistoryTable WHERE novelUrl = ?",
                [novelId],
                (txObj, res) => {
                    getHistory();
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    useFocusEffect(
        useCallback(() => {
            getHistory();
        }, [])
    );

    return (
        <>
            <CustomAppbar title="History" />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                <FlatList
                    contentContainerStyle={{ flex: 1 }}
                    data={history}
                    keyExtractor={(item) => item.historyId.toString()}
                    renderItem={({ item }) => (
                        <HistoryCard
                            item={item}
                            deleteHistory={deleteHistory}
                            navigation={navigation}
                        />
                    )}
                    ListFooterComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    ListEmptyComponent={
                        !loading && (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
                                        fontSize: 45,
                                        fontWeight: "bold",
                                    }}
                                >
                                    (˘･_･˘)
                                </Text>
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
                                        fontWeight: "bold",
                                        marginTop: 10,
                                        textAlign: "center",
                                        paddingHorizontal: 30,
                                    }}
                                >
                                    Nothing read recently.
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </>
    );
};

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    historyCard: {
        // backgroundColor: "pink",
        // paddingVertical: 10,
        // marginVertical: 5,
        // paddingHorizontal: 20,
        marginTop: 10,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
});
