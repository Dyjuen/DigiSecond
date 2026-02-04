import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { Alert } from "react-native";

/**
 * Token Validator Hook
 * 
 * Validates the stored JWT token on app startup.
 * If expired, clears auth and shows a message to the user.
 * 
 * Usage: Call this hook in the root _layout.tsx
 */
export function useTokenValidator() {
    const { token, isTokenExpired, clearAuth } = useAuthStore();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Only check once on mount
        if (hasChecked) return;

        // Skip if no token
        if (!token) {
            setHasChecked(true);
            return;
        }

        // Check if token is expired
        if (isTokenExpired()) {
            console.log("[TokenValidator] Token expired, clearing auth");

            // Clear the auth store
            clearAuth();

            // Show alert to user
            Alert.alert(
                "Session Expired",
                "Your login session has expired. Please log in again to continue.",
                [
                    {
                        text: "Log In",
                        onPress: () => router.replace("/login"),
                    },
                ]
            );
        } else {
            console.log("[TokenValidator] Token is valid");
        }

        setHasChecked(true);
    }, [token, isTokenExpired, clearAuth, hasChecked]);
}
