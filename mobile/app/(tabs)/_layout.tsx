import React from 'react';
import { Tabs, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { HomeHeader } from '../../src/components/HomeHeader';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outlineVariant,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: true,
                    header: () => <HomeHeader />,
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
                    tabBarLabel: 'Home'
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Upload',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-box-outline" size={24} color={color} />,
                    tabBarLabel: 'Upload'
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push('/listing/create');
                    },
                })}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
