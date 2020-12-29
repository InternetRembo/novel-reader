import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, Image } from "react-native";
import { TouchableRipple, IconButton, Appbar } from "react-native-paper";
import { theme } from "../../theming/theme";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const History = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();

    const getHistory = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT HistoryTable.chapterUrl, HistoryTable.historyId, HistoryTable.chapterName, HistoryTable.lastRead, LibraryTable.novelName, LibraryTable.novelCover, LibraryTable.novelUrl, LibraryTable.extensionId FROM HistoryTable INNER JOIN LibraryTable ON HistoryTable.novelUrl = LibraryTable.novelUrl ORDER BY HistoryTable.lastRead DESC",
                null,
                (txObj, { rows: { _array } }) => {
                    setNovels(_array);
                    // console.log(_array);
                    setLoading(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const deleteHistory = (name) => {
        db.transaction((tx) => {
            tx.executeSql(
                "DELETE FROM HistoryTable WHERE novelUrl = ?",
                [name],
                (txObj, { rows: { _array } }) => {
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
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                <Appbar.Content
                    title="History"
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                />
            </Appbar.Header>
            <View style={styles.container}>
                <FlatList
                    contentContainerStyle={{ flex: 1 }}
                    data={novels}
                    keyExtractor={(item) => item.historyId.toString()}
                    renderItem={({ item }) => (
                        <TouchableRipple
                            style={styles.historyCard}
                            rippleColor={theme.rippleColorDark}
                            borderless
                            onPress={() =>
                                navigation.navigate("NovelItem", {
                                    novelName: item.novelName,
                                    novelCover: item.novelCover,
                                    extensionId: item.extensionId,
                                    novelUrl: item.novelUrl,
                                })
                            }
                        >
                            <>
                                <Image
                                    source={{ uri: item.novelCover }}
                                    style={{
                                        height: 80,
                                        width: 57,
                                        borderTopLeftRadius: 4,
                                        borderBottomLeftRadius: 4,
                                    }}
                                />
                                <View
                                    style={{
                                        marginLeft: 15,
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View>
                                        <Text
                                            style={{
                                                color: "white",
                                                fontWeight: "bold",
                                                fontSize: 16,
                                            }}
                                        >
                                            {item.novelName}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginTop: 2,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {`Ch. ${item.chapterName
                                                .replace(/^\D+/g, "")
                                                .substring(0, 4)} - ${moment(
                                                item.lastRead
                                            ).calendar()}`}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                        }}
                                    >
                                        <IconButton
                                            icon="delete-outline"
                                            size={24}
                                            color={theme.textColorPrimaryDark}
                                            style={{
                                                marginRight: 0,
                                            }}
                                            onPress={() =>
                                                deleteHistory(item.novelUrl)
                                            }
                                        />
                                        <IconButton
                                            icon="play"
                                            size={24}
                                            color={theme.textColorPrimaryDark}
                                            style={{ marginRight: 10 }}
                                            onPress={() =>
                                                navigation.navigate(
                                                    "ChapterItem",
                                                    {
                                                        chapterUrl:
                                                            item.chapterUrl,
                                                        extensionId:
                                                            item.extensionId,
                                                        novelUrl: item.novelUrl,
                                                        novelName:
                                                            item.novelName,
                                                        novelCover:
                                                            item.novelCover,
                                                        chapterName:
                                                            item.chapterName,
                                                    }
                                                )
                                            }
                                        />
                                    </View>
                                </View>
                            </>
                        </TouchableRipple>
                    )}
                    ListEmptyComponent={
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
        backgroundColor: "#202125",
        backgroundColor: "#000000",
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
