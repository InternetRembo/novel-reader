import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveReaderTheme = async (val) => {
    AsyncStorage.setItem("@reader_theme", JSON.stringify(val));
};

export const getReaderTheme = async () => {
    let theme = await AsyncStorage.getItem("@reader_theme").then((value) => {
        if (value) return JSON.parse(value);
    });

    return theme;
};

export const setAppTheme = async (val) => {
    AsyncStorage.setItem("@application_theme", JSON.stringify(val));
};

export const getAppTheme = async () => {
    let theme = await AsyncStorage.getItem("@application_theme").then(
        (value) => {
            if (value) return JSON.parse(value);
        }
    );

    return theme;
};
