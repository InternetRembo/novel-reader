import React from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import easeGradient from "react-native-easing-gradient";

const NovelInfoContainer = ({ children }) => (
    <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({ children, source, theme }) => {
    const { colors, locations } = easeGradient({
        colorStops: {
            0: { color: "rgba(0,0,0,0.2)" },
            1: { color: theme.colorPrimaryDark },
        },
    });

    return (
        <ImageBackground source={source} style={styles.coverImage}>
            <LinearGradient
                colors={colors}
                locations={locations}
                style={styles.linearGradient}
            >
                {children}
            </LinearGradient>
        </ImageBackground>
    );
};

const NovelThumbnail = ({ source }) => (
    <Image source={source} style={styles.novelThumbnail} />
);

const NovelTitle = ({ theme, children }) => (
    <Text
        numberOfLines={2}
        style={[styles.novelTitle, { color: theme.textColorPrimary }]}
    >
        {children}
    </Text>
);

const NovelAuthor = ({ theme, children }) => (
    <Text
        style={[styles.novelAuthor, { color: theme.textColorSecondary }]}
        numberOfLines={2}
    >
        {children}
    </Text>
);

const NovelInfo = ({ theme, children }) => (
    <Text
        style={[styles.novelInfo, { color: theme.textColorSecondary }]}
        numberOfLines={1}
    >
        {children}
    </Text>
);

const FollowButton = ({ theme, onPress, followed }) => (
    <Chip
        mode="outlined"
        icon={() => (
            <MaterialCommunityIcons
                name={followed ? "heart" : "heart-outline"}
                size={21}
                color={theme.colorAccent}
            />
        )}
        onPress={onPress}
        style={[
            { backgroundColor: theme.colorPrimaryDark },
            styles.followButton,
        ]}
        textStyle={{
            fontWeight: "bold",
            color: theme.textColorPrimary,
        }}
    >
        {followed ? "In Library" : "Add to library"}
    </Chip>
);

const TrackerButton = ({ theme, isTracked, onPress }) => (
    <Chip
        mode="outlined"
        icon={() => (
            <MaterialCommunityIcons
                name={isTracked ? "check" : "sync"}
                size={21}
                color={theme.colorAccent}
            />
        )}
        onPress={onPress}
        style={[
            styles.followButton,
            { backgroundColor: theme.colorPrimaryDark },
        ]}
        textStyle={{
            fontWeight: "bold",
            color: theme.textColorPrimary,
        }}
    >
        {isTracked ? "Tracked" : "Tracking"}
    </Chip>
);

const GenreChip = ({ children, theme }) => (
    <Text
        style={[
            styles.genreChip,
            {
                color: theme.colorAccent,
                borderColor: theme.colorAccent,
                backgroundColor: theme.colorPrimary,
            },
        ]}
    >
        {children}
    </Text>
);

const NovelGenres = ({ theme, genre }) => {
    const data = genre.split(",");

    const renderItem = ({ item }) => (
        <GenreChip theme={theme}>{item}</GenreChip>
    );

    return (
        <FlatList
            contentContainerStyle={styles.novelGenres}
            horizontal
            data={data}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
        />
    );
};

export {
    NovelInfoContainer,
    CoverImage,
    NovelThumbnail,
    NovelTitle,
    NovelAuthor,
    NovelInfo,
    FollowButton,
    TrackerButton,
    NovelGenres,
};

const styles = StyleSheet.create({
    novelInfoContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 16,
        paddingTop: 90,
    },
    coverImage: {
        height: 285,
    },
    linearGradient: {
        height: 286,
    },
    novelThumbnail: {
        height: 160,
        width: 110,
        margin: 3.2,
        borderRadius: 6,
    },
    novelTitle: {
        fontWeight: "bold",
        fontSize: 18,
    },
    novelAuthor: {
        marginVertical: 3,
        fontSize: 14,
        fontWeight: "bold",
    },
    novelInfo: {
        marginVertical: 3,
        fontSize: 14,
    },
    followButton: {
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 16,
        paddingLeft: 4,
        borderWidth: 0,
        elevation: 0,
    },
    novelGenres: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    genreChip: {
        flex: 1,
        justifyContent: "center",
        paddingVertical: 2,
        paddingHorizontal: 10,
        marginHorizontal: 2,
        fontSize: 13,
        borderWidth: 1,
        borderRadius: 50,
    },
});
