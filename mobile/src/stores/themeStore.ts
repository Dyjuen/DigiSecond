import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeState {
    isDarkMode: boolean;
    useSystemTheme: boolean;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
    setUseSystemTheme: (useSystem: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            isDarkMode: Appearance.getColorScheme() === 'dark',
            useSystemTheme: true,
            toggleTheme: () => {
                set((state) => ({
                    isDarkMode: !state.isDarkMode,
                    useSystemTheme: false // Manual toggle disables system following
                }));
            },
            setTheme: (isDark) => set({
                isDarkMode: isDark,
                useSystemTheme: false // Manual set disables system following
            }),
            setUseSystemTheme: (useSystem) => {
                set({ useSystemTheme: useSystem });
                if (useSystem) {
                    const scheme = Appearance.getColorScheme();
                    set({ isDarkMode: scheme === 'dark' });
                }
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Subscribe to system theme changes inside the store setup if possible, 
            // but usually this is done in a component or effect. 
            // We'll update the initial state logic above.
        }
    )
);

