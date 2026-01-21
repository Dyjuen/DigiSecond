import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

/**
 * Shared colors - must match web (see shared-design-tokens)
 */
const sharedColors = {
    primary: "#22c55e",
    primaryContainer: "#16a34a",
    secondary: "#3b82f6",
    secondaryContainer: "#2563eb",
    error: "#ef4444",
    errorContainer: "#fecaca",
};

/**
 * Light theme for React Native Paper
 */
export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...sharedColors,
        background: "#ffffff",
        surface: "#fafafa",
        surfaceVariant: "#f5f5f5",
        onSurface: "#171717",
        onSurfaceVariant: "#737373",
        outline: "#e5e5e5",
        outlineVariant: "#d4d4d4",
    },
};

/**
 * Dark theme for React Native Paper
 */
export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...sharedColors,
        background: "#171717",
        surface: "#262626",
        surfaceVariant: "#303030",
        onSurface: "#fafafa",
        onSurfaceVariant: "#a3a3a3",
        outline: "#404040",
        outlineVariant: "#525252",
    },
};

export type AppTheme = typeof lightTheme;
