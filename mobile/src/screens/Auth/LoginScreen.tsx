import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button, TextInput, ActivityIndicator, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

export default function LoginScreen() {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { promptAsync, loading: googleLoading } = useGoogleAuth({
        onSuccess: () => {
            router.replace("/(tabs)");
        },
        onError: (err: string) => {
            setError(err);
        },
    });

    const handleEmailLogin = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return;
        }

        setEmailLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/auth/signin/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    callbackUrl: `${apiUrl}/auth/callback`,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to send magic link");
            }

            alert(`Magic link sent to ${email}! Please check your email.`);
            setEmail("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send magic link";
            setError(message);
        } finally {
            setEmailLoading(false);
        }
    };

    const isLoading = googleLoading || emailLoading;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.content}>
                {/* Logo/Branding */}
                <View style={styles.header}>
                    <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
                        DigiSecond
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                        Buy and sell digital goods securely
                    </Text>
                </View>

                {/* Error message */}
                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                        <Text style={{ color: theme.colors.onErrorContainer }}>{error}</Text>
                    </View>
                )}

                {/* Google OAuth Button */}
                <Button
                    mode="contained"
                    onPress={() => promptAsync()}
                    disabled={isLoading}
                    style={styles.googleButton}
                    contentStyle={styles.buttonContent}
                >
                    {googleLoading ? "Authenticating..." : "Continue with Google"}
                </Button>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                    <Text variant="bodySmall" style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                        OR
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                </View>

                {/* Email Magic Link */}
                <View style={styles.emailSection}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        disabled={isLoading}
                        style={styles.input}
                    />
                    <Button
                        mode="outlined"
                        onPress={handleEmailLogin}
                        disabled={isLoading || !email}
                        style={styles.emailButton}
                        contentStyle={styles.buttonContent}
                    >
                        {emailLoading ? "Sending..." : "Send Magic Link"}
                    </Button>
                </View>

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        fontWeight: "bold",
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    googleButton: {
        marginBottom: 24,
    },
    buttonContent: {
        height: 48,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
    },
    emailSection: {
        gap: 12,
    },
    input: {
        backgroundColor: "transparent",
    },
    emailButton: {
        marginTop: 4,
    },
    loadingContainer: {
        marginTop: 24,
        alignItems: "center",
    },
});
