import React from "react";
import { View } from "react-native";
import * as Linking from "expo-linking";

import { Appbar } from "../../Components/Appbar";

import { useSelector } from "react-redux";
import { Divider, ListItem, ListSection } from "../../Components/List";

const AboutScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <>
            <Appbar title="About" onBackAction={() => navigation.goBack()} />
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
                <ListSection>
                    <ListItem
                        title="Version"
                        description="Stable 1.0.16"
                        theme={theme}
                    />
                    <ListItem
                        title="Build Time"
                        description="03-05-21 20:45 PM"
                        theme={theme}
                    />
                    <ListItem
                        title="What's new"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/rajarsheechatterjee/lnreader/commits/main"
                            )
                        }
                        theme={theme}
                    />
                    <Divider theme={theme} />
                    <ListItem
                        title="Discord"
                        description="https://discord.gg/QdcWN4MD63"
                        onPress={() =>
                            Linking.openURL("https://discord.gg/QdcWN4MD63")
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="Github"
                        description="https://github.com/rajarsheechatterjee/lnreader"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/rajarsheechatterjee/lnreader"
                            )
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="Extensions"
                        description="https://github.com/rajarsheechatterjee/lnreader-extensions"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/rajarsheechatterjee/lnreader-extensions"
                            )
                        }
                        theme={theme}
                    />
                </ListSection>
            </View>
        </>
    );
};

export default AboutScreen;
