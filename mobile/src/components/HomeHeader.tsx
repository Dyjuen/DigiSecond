import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Animated, Easing } from "react-native";
import { Text, useTheme, IconButton, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export const HomeHeader = ({
    title,
    isSearchMode,
    searchQuery,
    onSearchChange,
    onBack
}: {
    title?: string;
    isSearchMode?: boolean;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onBack?: () => void;
}) => {
    const theme = useTheme();
    const { user } = useAuthStore();

    // Animation values
    const backButtonWidth = useRef(new Animated.Value(0)).current;
    const backButtonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isSearchMode) {
            // Reset to 0 to ensure animation plays on mount/transition
            backButtonWidth.setValue(0);
            backButtonOpacity.setValue(0);

            Animated.parallel([
                Animated.timing(backButtonWidth, {
                    toValue: 40, // Target width for back button area & margin
                    duration: 300,
                    useNativeDriver: false, // Width is layout property
                    easing: Easing.out(Easing.ease),
                }),
                Animated.timing(backButtonOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                })
            ]).start();
        }
    }, [isSearchMode]);

    const handleProfilePress = () => {
        if (!user) {
            router.push("/login");
        } else {
            router.push("/(tabs)/settings");
        }
    };

    return (
        <Surface style={{ backgroundColor: theme.colors.background }} elevation={0}>
            <SafeAreaView edges={['top']} style={[styles.safeArea, isSearchMode && { paddingTop: 8 }]}>
                <View style={[styles.container, isSearchMode && { height: 48 }]}>
                    {/* Back Button (Only in Search Mode) */}
                    {isSearchMode && (
                        <Animated.View style={{
                            width: backButtonWidth,
                            opacity: backButtonOpacity,
                            overflow: 'hidden',
                            justifyContent: 'center',
                            // backButton style has marginRight: 8, we handle spacing via width 
                        }}>
                            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Search Bar or Title */}
                    {isSearchMode ? (
                        <View style={{ flex: 1, marginRight: 8 }}>
                            {/* We render a customized Searchbar or standard one. 
                                 Using standard React Native Paper Searchbar but styling it to match "Home" look 
                              */}
                            <View style={[styles.activeSearchBarContainer, { backgroundColor: theme.colors.surfaceVariant, height: 40 }]}>
                                <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.onSurfaceVariant} style={{ marginLeft: 12, marginRight: 8 }} />
                                <TextInput
                                    placeholder="Cari di DigiSecond"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    value={searchQuery}
                                    onChangeText={onSearchChange}
                                    style={{ flex: 1, color: theme.colors.onSurface, height: 40, paddingVertical: 0, backgroundColor: 'transparent' }}
                                    autoFocus={true}
                                    onFocus={() => {
                                        // Optional: Add focus logic if needed, currently controlled by parent state
                                    }}
                                />
                                {searchQuery ? (
                                    <TouchableOpacity onPress={() => onSearchChange?.('')}>
                                        <MaterialCommunityIcons name="close" size={20} color={theme.colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>
                    ) : title ? (
                        <Text variant="titleMedium" style={{ flex: 1, fontWeight: 'bold' }}>{title}</Text>
                    ) : (
                        <TouchableOpacity
                            style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={() => router.push("/search")}
                        >
                            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>Cari di DigiSecond</Text>
                        </TouchableOpacity>
                    )}

                    {/* Icons (Hide in Search Mode? User said "keep homeheader", usually minimal icons in search) */}
                    {!isSearchMode && (
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
                    )}
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
    backButton: {
        marginRight: 8,
    },
    activeSearchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        // Match searchBar properties
        height: 40,
        borderRadius: 8,
        flex: 1,
    }
});
