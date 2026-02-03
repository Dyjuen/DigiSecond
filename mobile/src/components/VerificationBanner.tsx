import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, IconButton, useTheme } from "react-native-paper";
import { useAuctionCountdown } from "../hooks/useAuctionCountdown";

// Define strict colors from design tokens
const COLORS = {
    brandPrimary: "#6366f1", // brand-primary
    brandPrimarySubtle: "#e0e7ff", // brand-primary-subtle
    error: "#ef4444", // error
    errorLight: "#fecaca", // error-light
    success: "#22c55e", // success
};

interface VerificationBannerProps {
    deadline: Date;
    isBuyer: boolean;
    onConfirmReceived: () => void;
    onReportIssue: () => void;
}

export default function VerificationBanner({
    deadline,
    isBuyer,
    onConfirmReceived,
    onReportIssue
}: VerificationBannerProps) {
    const theme = useTheme();

    // Use the existing hook
    const { timeLeft, isUrgent, isExpired } = useAuctionCountdown(deadline);

    if (isExpired) {
        return (
            <View style={[styles.container, { backgroundColor: COLORS.success }]}>
                <View style={styles.row}>
                    <IconButton icon="check-circle" iconColor="white" size={20} />
                    <Text style={{ color: "white", fontWeight: "bold" }}>Transaction Completed</Text>
                </View>
            </View>
        );
    }

    // Determine styles based on urgency
    const bgColor = isUrgent ? COLORS.errorLight : COLORS.brandPrimarySubtle;
    const textColor = isUrgent ? COLORS.error : COLORS.brandPrimary;
    const iconColor = isUrgent ? COLORS.error : COLORS.brandPrimary;

    return (
        <View style={[styles.container, { backgroundColor: bgColor, borderBottomWidth: 1, borderBottomColor: isUrgent ? COLORS.error : 'transparent' }]}>
            <View style={styles.headerRow}>
                <View style={styles.timerContainer}>
                    <IconButton
                        icon={isUrgent ? "alert-circle" : "clock-outline"}
                        iconColor={iconColor}
                        size={20}
                        style={styles.icon}
                    />
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        Verify within: {timeLeft}
                    </Text>
                </View>
            </View>

            {isBuyer && (
                <View style={styles.actionsRow}>
                    <Button
                        mode="contained"
                        onPress={onConfirmReceived}
                        style={{ backgroundColor: COLORS.brandPrimary, flex: 1, marginRight: 8 }}
                        labelStyle={{ fontSize: 13 }}
                        compact
                    >
                        Confirm Received
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={onReportIssue}
                        textColor={COLORS.error}
                        style={{ borderColor: COLORS.error, flex: 1 }}
                        labelStyle={{ fontSize: 13 }}
                        compact
                    >
                        Report Issue
                    </Button>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        elevation: 2,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 8,
    },
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        margin: 0,
        marginRight: 4,
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
