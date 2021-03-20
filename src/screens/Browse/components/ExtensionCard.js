import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableRipple, Button } from "react-native-paper";

import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const ExtensionCard = ({ item }) => {
    const { sourceName, sourceCover, sourceLanguage } = item;

    const navigation = useNavigation();

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            style={styles.extensionCard}
            onPress={() => navigation.navigate(sourceName + "Stack")}
            rippleColor={theme.rippleColorDark}
        >
            <>
                <Image
                    source={{
                        uri: sourceCover,
                    }}
                    style={styles.extensionIcon}
                    resizeMode="contain"
                />
                <View style={styles.extensionDetails}>
                    <View>
                        <Text
                            style={{
                                color: theme.textColorPrimaryDark,
                                fontSize: 14,
                            }}
                        >
                            {sourceName}
                        </Text>
                        <Text
                            style={{
                                color: theme.textColorSecondaryDark,
                                fontSize: 12,
                            }}
                        >
                            {sourceLanguage}
                        </Text>
                    </View>
                    <View>
                        <Button
                            labelStyle={{
                                letterSpacing: 0,
                            }}
                            uppercase={false}
                            color={theme.colorAccentDark}
                            onPress={() =>
                                navigation.navigate(sourceName + "Stack")
                            }
                        >
                            Browse
                        </Button>
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default ExtensionCard;

const styles = StyleSheet.create({
    extensionCard: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    extensionIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    extensionDetails: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 16,
    },
});
