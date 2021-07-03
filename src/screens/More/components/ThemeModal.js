import React from "react";
import { StyleSheet } from "react-native";
import { Portal, Modal, Checkbox } from "react-native-paper";

import { setStatusBarStyle } from "expo-status-bar";
import { setAppTheme } from "../../../redux/settings/settings.actions";
import ImmersiveMode from "react-native-immersive-mode";

const ThemeModal = ({ themeModalVisible, hidethemeModal, dispatch, theme }) => {
    const themes = [
        { id: 0, name: "AMOLED Dark", statusBar: "light" },
        { id: 1, name: "Light", statusBar: "dark" },
        { id: 2, name: "Dark", statusBar: "light" },
        { id: 3, name: "Midnight Dusk", statusBar: "light" },
        { id: 4, name: "Lime", statusBar: "light" },
        { id: 6, name: "Hot Pink", statusBar: "light" },
        { id: 7, name: "Strawberry Daiquiri", statusBar: "dark" },
        { id: 5, name: "Iris Blue", statusBar: "light" },
    ];

    const renderThemeCheckboxes = () =>
        themes.map((item) => (
            <Checkbox.Item
                key={item.id}
                label={item.name}
                labelStyle={{ color: theme.textColorPrimary }}
                status={theme.id === item.id ? "checked" : "unchecked"}
                mode="ios"
                color={theme.colorAccent}
                onPress={() => {
                    dispatch(setAppTheme(item.id));
                    setStatusBarStyle(item.statusBar);
                    ImmersiveMode.setBarColor(item.colorPrimary);
                }}
            />
        ));

    return (
        <Portal>
            <Modal
                visible={themeModalVisible}
                onDismiss={hidethemeModal}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                {renderThemeCheckboxes()}
            </Modal>
        </Portal>
    );
};

export default ThemeModal;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
