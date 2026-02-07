import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator, useTheme, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../src/lib/api";

export default function PaymentResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theme = useTheme();
    const utils = api.useUtils();

    const status = params.status as string;
    const isSuccess = status === "success";

    useEffect(() => {
        // Invalidate queries to refresh data
        utils.transaction.invalidate();
        utils.payment.invalidate();
        utils.listing.invalidate();

        // Auto-redirect after delay
        const timer = setTimeout(() => {
            if (isSuccess) {
                // Go to chat to see the transaction
                router.replace("/(tabs)/chat");
            } else {
                // Go back to home/listing
                router.replace("/(tabs)");
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [status]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                {isSuccess ? (
                    <>
                        <Text variant="displaySmall" style={{ color: theme.colors.primary, marginBottom: 16, textAlign: 'center' }}>
                            Payment Successful!
                        </Text>
                        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 32 }}>
                            Your payment has been verifying. Redirecting you to your transactions...
                        </Text>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </>
                ) : (
                    <>
                        <Text variant="displaySmall" style={{ color: theme.colors.error, marginBottom: 16, textAlign: 'center' }}>
                            Payment Failed
                        </Text>
                        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 32 }}>
                            Something went wrong or the payment was cancelled.
                        </Text>
                        <Button mode="contained" onPress={() => router.replace("/(tabs)")}>
                            Return Home
                        </Button>
                    </>
                )}
            </View>
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
    content: {
        alignItems: "center",
        maxWidth: 400,
    }
});
