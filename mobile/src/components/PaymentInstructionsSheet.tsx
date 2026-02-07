import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Easing, Platform, UIManager, LayoutAnimation } from "react-native";
import { Text, Portal, Modal, Button, IconButton, useTheme, Card, List } from "react-native-paper";
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { api } from "../lib/api";

// Define strict colors from design tokens
const COLORS = {
    brandPrimary: "#6366f1", // brand-primary
    warning: "#f59e0b", // warning
    neutral100: "#f4f4f5", // neutral-100
    neutral900: "#18181b", // neutral-900
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface PaymentInstructionsSheetProps {
    visible: boolean;
    onDismiss: () => void;
    amount: number;
    paymentMethod: "VA" | "EWALLET" | "QRIS";
    onPaymentComplete: () => void;
    invoiceUrl?: string;
    transactionId?: string;
    expiresAt?: Date;
}

export default function PaymentInstructionsSheet({
    visible,
    onDismiss,
    amount,
    paymentMethod,
    onPaymentComplete,
    invoiceUrl,
    transactionId,
    expiresAt
}: PaymentInstructionsSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Sheet slide animation
    const slideAnim = useRef(new Animated.Value(600)).current;

    // Accordion animation state
    const [expanded, setExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const expandAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(600);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    // Polling Logic
    const utils = api.useUtils();
    const { data: transactionStatus } = api.transaction.getById.useQuery(
        { transaction_id: transactionId || "" },
        {
            enabled: visible && !!transactionId,
            refetchInterval: (data: any) => {
                if (data?.status === "PAID" || data?.status === "COMPLETED") return false;
                return 3000; // Poll every 3 seconds
            },
        }
    );

    useEffect(() => {
        if (transactionStatus?.status === "PAID" || transactionStatus?.status === "COMPLETED") {
            onPaymentComplete();
        }
    }, [transactionStatus?.status]);

    const handlePayNow = async () => {
        if (invoiceUrl) {
            await WebBrowser.openBrowserAsync(invoiceUrl);
            // On return, polling will catch the update if payment was successful
            utils.transaction.getById.invalidate({ transaction_id: transactionId });
        } else {
            Alert.alert("Error", "Invoice URL not available");
        }
    };

    const handleDismiss = () => {
        Animated.timing(slideAnim, {
            toValue: 600,
            duration: 300,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                onDismiss();
            }
        });
    };

    const toggleExpand = () => {
        const targetValue = expanded ? 0 : 1;

        Animated.timing(expandAnim, {
            toValue: targetValue,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();

        setExpanded(!expanded);
    };

    // Rotation for the chevron
    const rotateAnim = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Account number copied to clipboard");
    };

    const MOCK_VA_NUMBER = "8277 0812 3456 7890";

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleDismiss}
                contentContainerStyle={{ flex: 1 }}
            >
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: theme.colors.background,
                            transform: [{ translateY: slideAnim }],
                            paddingBottom: Math.max(insets.bottom, 16) + 16,
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>Payment Details</Text>
                        <IconButton icon="close" onPress={handleDismiss} iconColor={theme.colors.onSurface} />
                    </View>

                    <ScrollView>
                        {/* Deadline Warning */}
                        <View style={styles.deadlineCard}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <IconButton icon="clock-outline" iconColor={COLORS.warning} size={20} style={{ margin: 0, marginRight: 4 }} />
                                <Text style={{ color: COLORS.warning, fontWeight: "bold" }}>
                                    Pay before: {expiresAt ? new Date(expiresAt).toLocaleTimeString() : '23:59:59'}
                                </Text>
                            </View>
                        </View>

                        {/* Payment Account Details */}
                        <View style={[styles.accountCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                                {paymentMethod === 'VA' ? 'BCA Virtual Account' :
                                    paymentMethod === 'EWALLET' ? 'E-Wallet Payment' : 'QRIS Payment'}
                            </Text>

                            <View style={styles.accountRow}>
                                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: "bold" }}>
                                    {invoiceUrl ? "Pay via Link" : MOCK_VA_NUMBER}
                                </Text>
                                <IconButton
                                    icon="content-copy"
                                    iconColor={COLORS.brandPrimary}
                                    onPress={() => copyToClipboard(MOCK_VA_NUMBER)}
                                />
                            </View>
                        </View>

                        {/* Total Amount */}
                        <View style={styles.amountRow}>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Total:</Text>
                            <Text variant="titleLarge" style={{ color: COLORS.brandPrimary, fontWeight: "bold" }}>
                                {formatPrice(amount)}
                            </Text>
                        </View>

                        {/* Instructions Container */}
                        <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                    How to pay
                                </Text>
                                <Animated.View style={{ transform: [{ rotate: rotateAnim }] }}>
                                    <IconButton
                                        icon="chevron-down"
                                        iconColor={theme.colors.onSurface}
                                        size={24}
                                        style={{ margin: 0 }}
                                    />
                                </Animated.View>
                            </TouchableOpacity>

                            {/* Collapsible Content */}
                            <Animated.View
                                style={{
                                    height: expandAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, contentHeight || 200]
                                    }),
                                    overflow: 'hidden'
                                }}
                            >
                                <View
                                    onLayout={(event) => {
                                        const h = event.nativeEvent.layout.height;
                                        if (h > 0 && h !== contentHeight) {
                                            setContentHeight(h);
                                        }
                                    }}
                                    style={styles.accordionContent}
                                >
                                    <List.Item title="1. Open your banking app / e-wallet" titleStyle={{ color: theme.colors.onSurfaceVariant }} left={props => <List.Icon {...props} icon="cellphone" />} />
                                    <List.Item title="2. Select Transfer or Payment" titleStyle={{ color: theme.colors.onSurfaceVariant }} left={props => <List.Icon {...props} icon="bank-transfer" />} />
                                    <List.Item title="3. Enter the Virtual Account number above" titleStyle={{ color: theme.colors.onSurfaceVariant }} left={props => <List.Icon {...props} icon="numeric-3-circle" />} />
                                    <List.Item title="4. Confirm payment details and pay" titleStyle={{ color: theme.colors.onSurfaceVariant }} left={props => <List.Icon {...props} icon="check-circle" />} />
                                </View>
                            </Animated.View>
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={invoiceUrl ? handlePayNow : onPaymentComplete}
                            style={{ backgroundColor: COLORS.brandPrimary }}
                            labelStyle={{ fontSize: 16, paddingVertical: 4 }}
                        >
                            {invoiceUrl ? "Pay Now" : "I've Made Payment"}
                        </Button>
                        <Button
                            mode="text"
                            onPress={handleDismiss}
                            style={{ marginTop: 8 }}
                        >
                            Pay Later
                        </Button>
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        // paddingBottom dynamic
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    deadlineCard: {
        alignItems: "center",
        marginBottom: 24,
    },
    accountCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    accountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    instructionContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    accordionContent: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    footer: {
        marginTop: 24,
    },
});
