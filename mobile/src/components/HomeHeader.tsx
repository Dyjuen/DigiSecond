import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, IconButton, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export const HomeHeader = () => {
    const theme = useTheme();
    const { user } = useAuthStore();

    const handleProfilePress = () => {
        if (!user) {
            router.push("/login");
        } else {
            // Navigate to profile/settings when logged in
            router.push("/(tabs)/settings");
        }
    };

    return (
        <Surface style={{ backgroundColor: theme.colors.background }} elevation={0}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Search Bar */}
                    <TouchableOpacity style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Cari di DigiSecond</Text>
                    </TouchableOpacity>

                    {/* Icons */}
                    <View style={styles.iconContainer}>
                        <IconButton
                            icon="bell-outline"
                            size={24}
                            onPress={() => { }}
                        />
                        <IconButton
                            icon="account-outline"
                            size={24}
                            onPress={handleProfilePress}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Surface>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        paddingBottom: 8,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 56,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
});
