import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Dimensions, Alert, Image, ActivityIndicator } from "react-native";
import { Text, Portal, Modal, Button, IconButton, useTheme, Divider, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { api } from "../lib/api";

// Define strict colors from design tokens
const COLORS = {
    brandPrimary: "#6366f1", // brand-primary
    brandPrimarySubtle: "#e0e7ff", // brand-primary-subtle
    neutral100: "#f4f4f5", // neutral-100
    neutral200: "#e4e4e7", // neutral-200
    success: "#22c55e", // success
    warning: "#f59e0b", // warning
};

interface PaymentSheetProps {
    visible: boolean;
    onDismiss: () => void;
    listing: {
        id: string;
        title: string;
        price: number;
        sellerName: string;
        imageUrl?: string;
    };
    onSuccess?: () => void;
}

type PaymentStep = "SUMMARY" | "PAYMENT" | "SUCCESS";

export default function PaymentSheet({ visible, onDismiss, listing, onSuccess }: PaymentSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // State
    const [step, setStep] = useState<PaymentStep>("SUMMARY");
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Animations
    const slideAnim = useRef(new Animated.Value(600)).current;

    // API Utils
    const utils = api.useUtils();

    // Mutations
    const createTransaction = api.transaction.create.useMutation();
    const createPayment = api.payment.create.useMutation();
    const simulateSuccessMutation = api.payment.simulateSuccess.useMutation();

    // Reset state when visibility changes
    useEffect(() => {
        if (visible) {
            // Animate In
            slideAnim.setValue(600);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start();
        } else {
            // Reset state on close
            setTimeout(() => {
                setStep("SUMMARY");
                setTransactionId(null);
                setPaymentUrl(null);
                setExpiresAt(null);
                setIsProcessing(false);
            }, 300);
        }
    }, [visible]);

    // Polling Logic
    const { data: transactionStatus } = api.transaction.getById.useQuery(
        { transaction_id: transactionId || "" },
        {
            enabled: visible && !!transactionId && step === "PAYMENT",
            refetchInterval: (data: any) => {
                if (data?.status === "PAID" || data?.status === "COMPLETED") return false;
                return 3000; // Poll every 3 seconds
            },
        }
    );

    // Watch for payment completion
    useEffect(() => {
        if (step === "PAYMENT" && (transactionStatus?.status === "PAID" || transactionStatus?.status === "COMPLETED")) {
            setStep("SUCCESS");
            if (onSuccess) onSuccess();
        }
    }, [transactionStatus?.status, step]);

    const handleDismiss = () => {
        // If payment is pending, warn user? Or just let them close and they can resume later?
        // Defaulting to close animation
        animateClose(onDismiss);
    };

    const animateClose = (callback: () => void) => {
        Animated.timing(slideAnim, {
            toValue: 600,
            duration: 300,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                callback();
            }
        });
    };

    const handleConfirmPurchase = async () => {
        try {
            setIsProcessing(true);

            // 1. Create Transaction (Default to VA as generic method for now)
            const transaction = await createTransaction.mutateAsync({
                listing_id: listing.id,
                payment_method: "VA"
            });

            setTransactionId(transaction.transaction_id);

            // 2. Create Payment Invoice
            const redirectUrl = Linking.createURL("payment-result");
            const payment = await createPayment.mutateAsync({
                transaction_id: transaction.transaction_id,
                redirect_url: redirectUrl
            });

            setPaymentUrl(payment.invoice_url);
            setExpiresAt(payment.expires_at);

            // 3. Move to Payment Step
            setStep("PAYMENT");

            // 4. Auto-open Webview
            if (payment.invoice_url) {
                await WebBrowser.openBrowserAsync(payment.invoice_url);
            }

        } catch (err: any) {
            Alert.alert("Transaction Failed", err.message || "Something went wrong");
        } finally {
            setIsProcessing(false);
        }
    };

    const openPaymentUrl = async () => {
        if (paymentUrl) {
            await WebBrowser.openBrowserAsync(paymentUrl);
        }
    };

    const handleSimulateSuccess = () => {
        if (!transactionId) return;
        simulateSuccessMutation.mutate(
            { transaction_id: transactionId },
            {
                onSuccess: () => {
                    Alert.alert("Dev Mode", "Payment simulated!");
                    // Polling will catch it, or we can force step change
                    setStep("SUCCESS");
                },
                onError: (err) => Alert.alert("Error", err.message),
            }
        );
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Render Steps
    const renderSummary = () => (
        <ScrollView style={{ maxHeight: 500 }}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="titleMedium" style={{ fontWeight: "bold", color: theme.colors.onSurfaceVariant }}>
                    {listing.title}
                </Text>
                <Text variant="headlineSmall" style={{ color: COLORS.brandPrimary, marginVertical: 4, fontWeight: "bold" }}>
                    {formatPrice(listing.price)}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Seller: {listing.sellerName}
                </Text>
            </View>

            <View style={styles.infoSection}>
                <IconButton icon="shield-check" size={24} style={{ margin: 0, marginRight: 8 }} iconColor={COLORS.brandPrimary} />
                <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>Secure Payment</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Your payment is held securely until you confirm receipt of the item.
                    </Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <IconButton icon="credit-card-outline" size={24} style={{ margin: 0, marginRight: 8 }} iconColor={COLORS.brandPrimary} />
                <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>Multiple Payment Methods</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Pay via Virtual Account (BCA, Mandiri, BRI, BNI), E-Wallets (GoPay, OVO, ShopeePay), or QRIS.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderPayment = () => (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color={COLORS.brandPrimary} style={{ marginBottom: 16 }} />
            <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 8 }}>Payment Pending</Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                Please complete your payment in the browser window.
            </Text>

            <Button
                mode="contained"
                onPress={openPaymentUrl}
                style={{ width: '100%', marginBottom: 12, backgroundColor: COLORS.brandPrimary }}
            >
                Open Payment Page
            </Button>

            <Button
                mode="outlined"
                onPress={() => utils.transaction.getById.invalidate({ transaction_id: transactionId || "" })}
                style={{ width: '100%' }}
            >
                Check Status
            </Button>

            {/* Dev Only: Simulate Success */}
            {__DEV__ && (
                <Button
                    mode="text"
                    onPress={handleSimulateSuccess}
                    textColor={COLORS.warning}
                    style={{ marginTop: 16 }}
                    loading={simulateSuccessMutation.isPending}
                >
                    [DEV] Simulate Success
                </Button>
            )}
        </View>
    );

    const renderSuccess = () => (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <IconButton icon="check" size={40} iconColor={COLORS.success} />
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: "bold", color: COLORS.success, marginBottom: 8 }}>Payment Successful!</Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                Your payment has been verified. You can now chat with the seller to arrange delivery.
            </Text>

            <Button
                mode="contained"
                onPress={() => {
                    handleDismiss();
                    router.push("/(tabs)/chat");
                }}
                style={{ width: '100%', backgroundColor: COLORS.brandPrimary }}
            >
                Go to Chats
            </Button>
        </View>
    );

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
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
                            {step === "SUMMARY" ? "Checkout" : step === "PAYMENT" ? "Payment" : "Success"}
                        </Text>
                        <IconButton icon="close" onPress={handleDismiss} iconColor={theme.colors.onSurface} />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                        {step === "SUMMARY" && renderSummary()}
                        {step === "PAYMENT" && renderPayment()}
                        {step === "SUCCESS" && renderSuccess()}
                    </View>

                    {/* Footer for Summary Step */}
                    {step === "SUMMARY" && (
                        <View style={styles.footer}>
                            <Button
                                mode="contained"
                                onPress={handleConfirmPurchase}
                                style={{ backgroundColor: COLORS.brandPrimary }}
                                labelStyle={{ fontSize: 16, paddingVertical: 4 }}
                                loading={isProcessing}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : `Pay Now - ${formatPrice(listing.price)}`}
                            </Button>
                        </View>
                    )}
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: '90%'
        // paddingBottom is dynamic
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingRight: 8,
    },
    footer: {
        marginTop: 16,
    },
});
