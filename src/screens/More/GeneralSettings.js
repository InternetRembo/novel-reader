import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import {
    Divider,
    ListItem,
    ListSection,
    ListSubHeader,
} from "../../components/List";
import { ScreenContainer } from "../../components/Common";

import { useTheme } from "../../hooks/reduxHooks";
import DisplayModeModal from "./components/DisplayModeModal";
import GridSizeModal from "./components/GridSizeModal";
import ThemeModal from "./components/ThemeModal";
import { setAccentColor } from "../../redux/settings/settings.actions";
import ColorPickerModal from "../../components/ColorPickerModal";

const GenralSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const { displayMode, novelsPerRow } = useSelector(
        (state) => state.settingsReducer
    );

    const displayModeLabel = (displayMode) => {
        const label = {
            0: "Compact Grid",
            1: "Comfortable Grid",
            2: "List",
        };

        return label[displayMode] ?? "Compact Grid";
    };

    /**
     * Display Mode Modal
     */
    const [displayModalVisible, setDisplayModalVisible] = useState(false);
    const showDisplayModal = () => setDisplayModalVisible(true);
    const hideDisplayModal = () => setDisplayModalVisible(false);

    /**
     * Theme Modal
     */
    const [themeModalVisible, setthemeModalVisible] = useState(false);
    const showthemeModal = () => setthemeModalVisible(true);
    const hidethemeModal = () => setthemeModalVisible(false);

    /**
     * Grid Size Modal
     */
    const [gridSizeModalVisible, setGridSizeModalVisible] = useState(false);
    const showGridSizeModal = () => setGridSizeModalVisible(true);
    const hideGridSizeModal = () => setGridSizeModalVisible(false);

    /**
     * Accent Color Modal
     */
    const [accentColorModal, setAccentColorModal] = useState(false);
    const showAccentColorModal = () => setAccentColorModal(true);
    const hideAccentColorModal = () => setAccentColorModal(false);

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="General" onBackAction={() => navigation.goBack()} />
            <ListSection>
                <ListSubHeader theme={theme}>Display</ListSubHeader>
                <ListItem
                    title="Display Mode"
                    description={displayModeLabel(displayMode)}
                    onPress={showDisplayModal}
                    theme={theme}
                />
                <ListItem
                    title="Items per row in library"
                    description={`${novelsPerRow} items per row`}
                    onPress={showGridSizeModal}
                    theme={theme}
                />
                <Divider theme={theme} />
                <ListSubHeader theme={theme}>Theme</ListSubHeader>
                <ListItem
                    title="Theme"
                    description={theme.name}
                    onPress={showthemeModal}
                    theme={theme}
                />
                <ListItem
                    title="Accent Color"
                    description={theme.colorAccent.toUpperCase()}
                    onPress={showAccentColorModal}
                    theme={theme}
                    iconColor={theme.colorAccent}
                    right="circle"
                />
            </ListSection>
            <DisplayModeModal
                displayMode={displayMode}
                displayModalVisible={displayModalVisible}
                hideDisplayModal={hideDisplayModal}
                dispatch={dispatch}
                theme={theme}
            />
            <GridSizeModal
                dispatch={dispatch}
                novelsPerRow={novelsPerRow}
                gridSizeModalVisible={gridSizeModalVisible}
                hideGridSizeModal={hideGridSizeModal}
                theme={theme}
            />
            <ThemeModal
                dispatch={dispatch}
                themeModalVisible={themeModalVisible}
                hidethemeModal={hidethemeModal}
                theme={theme}
            />
            <ColorPickerModal
                title="Accent color"
                modalVisible={accentColorModal}
                hideModal={hideAccentColorModal}
                color={theme.colorAccent}
                onSubmit={(val) => dispatch(setAccentColor(val))}
                theme={theme}
            />
        </ScreenContainer>
    );
};

export default GenralSettings;
