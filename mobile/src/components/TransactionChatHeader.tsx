import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text, IconButton, useTheme, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define strict colors from design tokens
const COLORS = {
    brandPrimary: "#6366f1", // brand-primary
    success: "#22c55e", // success
    warning: "#f59e0b", // warning
    neutral100: "#f4f4f5", // neutral-100
    neutral300: "#d4d4d8", // neutral-300
};

export type TransactionStatus = "PENDING_PAYMENT" | "PAID" | "ITEM_TRANSFERRED" | "VERIFIED" | "COMPLETED" | "CANCELLED";

interface TransactionChatHeaderProps {
    partnerName: string;
    listingTitle: string;
    listingPrice: number;
    status: TransactionStatus;
}

export default function TransactionChatHeader({
    partnerName,
    listingTitle,
    listingPrice,
    status
}: TransactionChatHeaderProps) {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Determine active step
    const getStepState = (stepIndex: number) => {
        // Steps: 0=Paid, 1=Transferred, 2=Verified
        const currentStep =
            status === "PENDING_PAYMENT" ? -1 :
                status === "PAID" ? 0 :
                    status === "ITEM_TRANSFERRED" ? 1 :
                        (status === "VERIFIED" || status === "COMPLETED") ? 2 : -1;

        if (currentStep > stepIndex) return "completed";
        if (currentStep === stepIndex) return "active";
        return "pending";
    };

    const StepIndicator = ({ label, state }: { label: string, state: "completed" | "active" | "pending" }) => {
        let color = COLORS.neutral300;
        let icon = "circle-outline";

        if (state === "completed") {
            color = COLORS.success;
            icon = "check-circle";
        } else if (state === "active") {
            color = COLORS.warning;
            icon = "circle-slice-5";
        }

        return (
            <View style={styles.stepContainer}>
                <IconButton icon={icon} iconColor={color} size={20} style={styles.stepIcon} />
                <Text style={{ fontSize: 10, color: state === "pending" ? COLORS.neutral300 : theme.colors.onSurface }}>
                    {label}
                </Text>
            </View>
        );
    };

    const Connector = ({ active }: { active: boolean }) => (
        <View style={[styles.connector, { backgroundColor: active ? COLORS.success : COLORS.neutral300 }]} />
    );

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.outline,
                borderBottomWidth: 1,
                // Add padding top for status bar + a little extra breathing room
                paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 0),
            }
        ]}>
            {/* Top Row: Navigation & Partner */}
            <View style={styles.navRow}>
                <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
                <Avatar.Text size={32} label={partnerName.charAt(0)} style={{ backgroundColor: theme.colors.secondaryContainer }} labelStyle={{ color: theme.colors.onSecondaryContainer }} />
                <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1, color: theme.colors.onSurface }}>{partnerName}</Text>
                <IconButton icon="dots-vertical" onPress={() => { }} iconColor={theme.colors.onSurface} />
            </View>

            {/* Listing Summary */}
            <View style={[styles.listingRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1, marginRight: 8, color: theme.colors.onSurfaceVariant }}>
                    {listingTitle}
                </Text>
                <Text variant="bodyMedium" style={{ color: COLORS.brandPrimary, fontWeight: "bold" }}>
                    {formatPrice(listingPrice)}
                </Text>
            </View>

            {/* Stepper */}
            <View style={styles.stepperRow}>
                <StepIndicator label="Paid" state={getStepState(0)} />
                <Connector active={getStepState(0) === "completed"} />
                <StepIndicator label="Sent" state={getStepState(1)} />
                <Connector active={getStepState(1) === "completed"} />
                <StepIndicator label="Verified" state={getStepState(2)} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 12,
    },
    navRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 8,
    },
    listingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    stepperRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    stepContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 60,
    },
    stepIcon: {
        margin: 0,
        marginBottom: 4,
    },
    connector: {
        height: 2,
        flex: 1,
        marginTop: -16, // Align with icon center approproximately
    },
});
