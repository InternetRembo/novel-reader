import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import {
    TouchableRipple,
    IconButton,
    Appbar as MaterialAppbar,
} from "react-native-paper";
import Constants from "expo-constants";

import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

export const Appbar = ({ title, onBackAction }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <MaterialAppbar.Header
            style={{ backgroundColor: theme.colorDarkPrimary }}
        >
            {onBackAction && (
                <MaterialAppbar.BackAction onPress={onBackAction} />
            )}
            <MaterialAppbar.Content
                title={title}
                titleStyle={{ color: theme.textColorPrimaryDark }}
            />
        </MaterialAppbar.Header>
    );
};

export const SearchAppbar = ({
    placeholder,
    getSearchResults,
    setSearchText,
    searchText,
    getNovels,
    setLoading,
    screen,
}) => {
    const searchRef = useRef(null);

    const navigation = useNavigation();

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            borderless
            onPress={() => searchRef.current.focus()}
            style={[
                styles.searchAppbarContainer,
                { backgroundColor: theme.searchBarColor },
            ]}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <IconButton
                        icon={screen === "Library" ? "magnify" : "arrow-left"}
                        color={theme.textColorSecondaryDark}
                        style={{ marginLeft: 0 }}
                        size={23}
                        onPress={() => {
                            if (screen === "Extension") {
                                navigation.goBack();
                            }
                        }}
                    />
                    <TextInput
                        ref={searchRef}
                        style={{
                            fontSize: 16,
                            color: theme.textColorSecondaryDark,
                        }}
                        placeholder={placeholder}
                        placeholderTextColor={theme.textColorSecondaryDark}
                        onChangeText={(text) => {
                            setSearchText(text);
                            if (screen === "Library") {
                                getSearchResults(text);
                            }
                        }}
                        onSubmitEditing={() => {
                            if (screen === "Extension") {
                                getSearchResults(searchText);
                            }
                        }}
                        defaultValue={searchText}
                    />
                </View>
                {searchText !== "" && (
                    <IconButton
                        icon="close"
                        color={theme.textColorSecondaryDark}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={() => {
                            setLoading?.(true);
                            getNovels();
                            setSearchText("");
                        }}
                    />
                )}
                <IconButton
                    icon="filter-variant"
                    color={theme.textColorSecondaryDark}
                    style={{ marginRight: 0 }}
                    size={23}
                    disabled
                    /**
                     * TODO
                     */
                    onPress={() => console.log("Filter Button Pressed")}
                />
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    searchAppbarContainer: {
        marginTop: Constants.statusBarHeight + 4,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        marginHorizontal: 12,
        elevation: 2,
    },
});
