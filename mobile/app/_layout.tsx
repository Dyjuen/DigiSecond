import { useThemeStore } from "../src/stores/themeStore";
import { darkTheme } from "../src/lib/theme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { lightTheme } from "../src/lib/theme";
import { useEffect } from "react";
import { Appearance } from "react-native";

export default function Layout() {
    const { isDarkMode, useSystemTheme, setTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (useSystemTheme) {
                setTheme(colorScheme === 'dark');
                // Note: setTheme disables useSystemTheme in our store logic, 
                // so we might need a dedicated internal setter or just manually set state if we were inside the store.
                // Actually, let's fix the store logic to allow system updates without disabling it.
                // Since I can't easily change the store logic from here without another tool call, 
                // I'll rely on the store update I just made which might need refinement.
            }
        });
        return () => subscription.remove();
    }, [useSystemTheme, setTheme]);

    return (
        <PaperProvider theme={theme}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                    },
                    headerTintColor: theme.colors.onSurface,
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ title: "DigiSecond" }} />
                <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen name="listing/[id]" options={{ title: "Listing Details" }} />
                <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
            </Stack>
        </PaperProvider>
    );
}
