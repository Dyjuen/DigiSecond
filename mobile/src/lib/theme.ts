import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const sharedColors = {
    primary: "#6366f1",
    secondary: "#06b6d4",
    tertiary: "#f59e0b", // accent gold
    error: "#ef4444",
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...sharedColors,
        primaryContainer: "#e0e7ff",
        onPrimaryContainer: "#1e1b4b",
        secondaryContainer: "#e0f2fe",
        onSecondaryContainer: "#0e7490",
        tertiaryContainer: "#fef3c7",
        onTertiaryContainer: "#78350f",
        errorContainer: "#fecaca",
        onErrorContainer: "#7f1d1d",
        background: "#ffffff",
        surface: "#fafafa",
        surfaceVariant: "#f4f4f5",
        onSurface: "#18181b",
        onSurfaceVariant: "#71717a",
        outline: "#e4e4e7",
        outlineVariant: "#d4d4d8",
    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...sharedColors,
        primaryContainer: "#312e81", // Indigo 900
        onPrimaryContainer: "#e0e7ff",
        secondaryContainer: "#164e63", // Cyan 900
        onSecondaryContainer: "#cffafe",
        tertiaryContainer: "#78350f", // Amber 900
        onTertiaryContainer: "#fef3c7",
        errorContainer: "#7f1d1d", // Red 900
        onErrorContainer: "#fecaca",
        background: "#18181b",
        surface: "#27272a",
        surfaceVariant: "#3f3f46",
        onSurface: "#fafafa",
        onSurfaceVariant: "#a1a1aa",
        outline: "#3f3f46",
        outlineVariant: "#52525b",
    },
};

// Custom shadows for 3D elements (use with StyleSheet)
export const shadows = {
    shadow3d: {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 10,
    },
    shadowCard: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
};
