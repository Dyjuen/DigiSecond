import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, useTheme } from 'react-native-paper';
import { useThemeStore } from '../../stores/themeStore';
import { router } from 'expo-router';

export const SettingsScreen = () => {
    const theme = useTheme();
    const { isDarkMode, toggleTheme } = useThemeStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <List.Item
                    title="Dark Mode"
                    left={() => <List.Icon icon="theme-light-dark" />}
                    right={() => (
                        <Switch value={isDarkMode} onValueChange={toggleTheme} />
                    )}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>Akun</List.Subheader>
                <List.Item
                    title="Profil & Verifikasi"
                    description="Update data diri dan KYC"
                    left={() => <List.Icon icon="account-details" />}
                    right={() => <List.Icon icon="chevron-right" />}
                    onPress={() => router.push("/profile")}
                />
            </List.Section>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
