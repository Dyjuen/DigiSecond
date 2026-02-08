import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "../src/stores/authStore";
import { useThemeStore } from "../src/stores/themeStore";

/**
 * Auth Callback Route
 * 
 * Handles deep links from the web callback page:
 * exp://10.0.2.2:8081/--/auth-callback?token=<jwt>
 * 
 * This route:
 * 1. Extracts the JWT token from search params
 * 2. Decodes it to get user info
 * 3. Stores the auth state
 * 4. Redirects to the home screen
 */
export default function AuthCallbackScreen() {
    const { token } = useLocalSearchParams<{ token: string }>();
    const { setAuth } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const processToken = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("No authentication token provided");
                return;
            }

            try {
                // Decode JWT to extract user info
                // JWT format: header.payload.signature
                const payloadBase64 = token.split(".")[1];
                if (!payloadBase64) {
                    throw new Error("Invalid token format");
                }

                // Decode base64url (replace - with +, _ with /, and pad)
                const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                const paddedBase64 = base64.padEnd(
                    base64.length + ((4 - (base64.length % 4)) % 4),
                    "="
                );
                const jsonPayload = atob(paddedBase64);
                const payload = JSON.parse(jsonPayload);

                // Extract user data from JWT payload
                const user = {
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name || payload.email,
                    avatar: null,
                    role: payload.role,
                    verified: payload.verified,
                };

                // Store auth data
                await setAuth(token, user);
                setStatus("success");

                console.log("[AuthCallback] Authentication successful:", user.email);

                // Navigate to home screen after a brief delay
                setTimeout(() => {
                    router.replace("/(tabs)");
                }, 1500);
            } catch (error) {
                console.error("[AuthCallback] Failed to process auth token:", error);
                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : "Failed to process authentication");
            }
        };

        processToken();
    }, [token, setAuth]);

    const backgroundColor = isDarkMode ? "#171717" : "#f5f5f5";
    const textColor = isDarkMode ? "#fafafa" : "#171717";
    const secondaryColor = isDarkMode ? "#a3a3a3" : "#737373";

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {status === "processing" && (
                <>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={[styles.title, { color: textColor }]}>
                        Signing you in...
                    </Text>
                    <Text style={[styles.subtitle, { color: secondaryColor }]}>
                        Please wait while we verify your credentials
                    </Text>
                </>
            )}

            {status === "success" && (
                <>
                    <View style={styles.successIcon}>
                        <Text style={styles.checkmark}>✓</Text>
                    </View>
                    <Text style={[styles.title, { color: textColor }]}>
                        Welcome back!
                    </Text>
                    <Text style={[styles.subtitle, { color: secondaryColor }]}>
                        Redirecting to home...
                    </Text>
                </>
            )}

            {status === "error" && (
                <>
                    <View style={styles.errorIcon}>
                        <Text style={styles.errorMark}>✕</Text>
                    </View>
                    <Text style={[styles.title, { color: textColor }]}>
                        Authentication Failed
                    </Text>
                    <Text style={[styles.subtitle, { color: secondaryColor }]}>
                        {errorMessage}
                    </Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 24,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: "center",
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
    },
    checkmark: {
        color: "#fff",
        fontSize: 40,
        fontWeight: "bold",
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
    },
    errorMark: {
        color: "#fff",
        fontSize: 40,
        fontWeight: "bold",
    },
});
