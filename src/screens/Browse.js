import React, { useEffect, useState } from "react";

import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
} from "react-native";
import { TouchableRipple, IconButton, Button } from "react-native-paper";

import { CustomAppbar } from "../components/common/Appbar";

import { useSelector } from "react-redux";

const Browse = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    const [loading, setLoading] = useState(true);
    const [extensions, setExtensions] = useState();

    useEffect(() => {
        fetch(`https://lnreader-extensions.herokuapp.com/api/`)
            .then((response) => response.json())
            .then((json) => {
                setExtensions(json);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <CustomAppbar title="Browse" />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                {!loading ? (
                    <FlatList
                        data={extensions}
                        keyExtractor={(item) => item.sourceId.toString()}
                        renderItem={({ item }) => (
                            <TouchableRipple
                                style={styles.sourceCard}
                                onPress={() =>
                                    navigation.navigate(
                                        item.sourceName + "Stack"
                                    )
                                }
                                rippleColor={theme.rippleColorDark}
                            >
                                <>
                                    <Image
                                        source={{
                                            uri: item.sourceCover,
                                        }}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                        }}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={{
                                            marginLeft: 15,
                                            flex: 1,
                                            justifyContent: "space-between",
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorPrimaryDark,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {item.sourceName}
                                            </Text>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorSecondaryDark,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {item.sourceLanguage}
                                            </Text>
                                        </View>
                                        <View>
                                            {/* <IconButton
                                            icon="magnify"
                                            color={theme.textColorSecondaryDark}
                                            size={24}
                                            onPress={() =>
                                                navigation.navigate(
                                                    item.sourceName + "Stack",
                                                    {
                                                        screen:
                                                            item.sourceName +
                                                            "Search",
                                                    }
                                                )
                                            }
                                        /> */}
                                            <Button
                                                labelStyle={{
                                                    letterSpacing: 0,
                                                }}
                                                uppercase={false}
                                                color={theme.colorAccentDark}
                                                onPress={() =>
                                                    navigation.navigate(
                                                        item.sourceName +
                                                            "Stack"
                                                    )
                                                }
                                            >
                                                Browse
                                            </Button>
                                        </View>
                                    </View>
                                </>
                            </TouchableRipple>
                        )}
                    />
                ) : (
                    <View style={{ padding: 20 }}>
                        <ActivityIndicator
                            size="small"
                            color={theme.colorAccentDark}
                        />
                    </View>
                )}
            </View>
        </>
    );
};

export default Browse;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sourceCard: {
        // backgroundColor: "pink",
        paddingVertical: 10,
        marginVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
});
