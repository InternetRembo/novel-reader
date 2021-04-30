import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import * as Linking from "expo-linking";
import { useSelector } from "react-redux";

const NewUpdateDialog = ({ newVersion }) => {
    const [newUpdateDialog, showNewUpdateDialog] = useState(true);
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Portal>
            <Modal
                visible={newUpdateDialog}
                onDismiss={() => showNewUpdateDialog(false)}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <Text
                    style={[
                        styles.modalHeader,
                        { color: theme.textColorPrimary },
                    ]}
                >
                    {`New update available ${newVersion.tag_name}`}
                </Text>
                <Text style={{ color: theme.textColorPrimary, fontSize: 17 }}>
                    {newVersion.body}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 30,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        labelStyle={{
                            color: theme.colorAccentDark,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccentDark } }}
                        onPress={() => showNewUpdateDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        labelStyle={{
                            color: theme.colorAccentDark,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccentDark } }}
                        onPress={() => Linking.openURL(res.downloadUrl)}
                    >
                        Install
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

export default NewUpdateDialog;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
    modalHeader: {
        fontSize: 20,
        marginBottom: 10,
    },
});
