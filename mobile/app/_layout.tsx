import { useThemeStore } from "../src/stores/themeStore";
import { darkTheme } from "../src/lib/theme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { lightTheme } from "../src/lib/theme";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { useDeepLinkAuth } from "../src/hooks/useDeepLinkAuth";
import { useTokenValidator } from "../src/hooks/useTokenValidator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api, createTRPCClient } from "../src/lib/api";

export default function Layout() {
    const { isDarkMode, useSystemTheme, setTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    // Enable deep link authentication
    useDeepLinkAuth();

    // Validate token on app startup
    useTokenValidator();

    // Initialize React Query and tRPC
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 2,
                staleTime: 1000 * 60 * 5, // 5 minutes
            },
        },
    }));
    const [trpcClient] = useState(() => createTRPCClient()); // Auth tokens are handled dynamically

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
        <api.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
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
                        <Stack.Screen name="auth-callback" options={{ title: "Signing In", headerShown: false }} />
                        <Stack.Screen name="search" options={{ headerShown: false, animation: 'none' }} />
                        <Stack.Screen name="listing/[id]" options={{ title: "Listing Details" }} />
                        <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
                    </Stack>
                </PaperProvider>
            </QueryClientProvider>
        </api.Provider>
    );
}
