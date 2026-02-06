import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Dimensions } from "react-native";
import { Text, Portal, Modal, Button, IconButton, useTheme, Divider, RadioButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define strict colors from design tokens
const COLORS = {
    brandPrimary: "#6366f1", // brand-primary
    brandPrimarySubtle: "#e0e7ff", // brand-primary-subtle
    neutral100: "#f4f4f5", // neutral-100
    neutral200: "#e4e4e7", // neutral-200
    brandPrimaryLight: "#818cf8", // brand-primary-light
};

type PaymentMethodType = "VA" | "EWALLET" | "QRIS";

interface PaymentSheetProps {
    visible: boolean;
    onDismiss: () => void;
    listing: {
        id: string;
        title: string;
        price: number;
        sellerName: string;
    };
    onConfirm: (method: PaymentMethodType) => void;
}

export default function PaymentSheet({ visible, onDismiss, listing, onConfirm }: PaymentSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("VA");
    const slideAnim = useRef(new Animated.Value(600)).current;

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

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const PaymentOption = ({
        type,
        label,
        icon,
        description
    }: {
        type: PaymentMethodType;
        label: string;
        icon: string;
        description: string;
    }) => {
        const isSelected = selectedMethod === type;

        const selectedBgColor = theme.dark
            ? "rgba(99, 102, 241, 0.2)"
            : COLORS.brandPrimarySubtle;

        return (
            <TouchableOpacity
                onPress={() => setSelectedMethod(type)}
                style={[
                    styles.optionCard,
                    {
                        borderColor: isSelected ? COLORS.brandPrimary : theme.colors.outline,
                        backgroundColor: isSelected ? selectedBgColor : "transparent",
                        borderWidth: isSelected ? 2 : 1,
                    }
                ]}
            >
                <IconButton
                    icon={icon}
                    size={24}
                    iconColor={isSelected ? COLORS.brandPrimary : theme.colors.onSurfaceVariant}
                    style={{ margin: 0 }}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text variant="titleSmall" style={{ fontWeight: isSelected ? "bold" : "normal", color: theme.colors.onSurface }}>
                        {label}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {description}
                    </Text>
                </View>
                <RadioButton
                    value={type}
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() => setSelectedMethod(type)}
                    color={COLORS.brandPrimary}
                />
            </TouchableOpacity>
        );
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleDismiss}
                contentContainerStyle={{ flex: 1 }} // Flex 1 to allow absolute positioning inside to relate to full screen? 
            // Actually for Modal, if we use absolute inside, we just need the container to NOT restrict us. flex:1 covers content.
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
                        <Text variant="titleLarge" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>Buy Now</Text>
                        <IconButton icon="close" onPress={handleDismiss} iconColor={theme.colors.onSurface} />
                    </View>

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

                        <Text variant="titleMedium" style={{ marginVertical: 16, fontWeight: "bold", color: theme.colors.onSurface }}>
                            Choose Payment Method
                        </Text>

                        <View style={styles.optionsContainer}>
                            <PaymentOption
                                type="VA"
                                label="Virtual Account"
                                icon="bank"
                                description="BCA, Mandiri, BNI, BRI"
                            />
                            <PaymentOption
                                type="EWALLET"
                                label="E-Wallet"
                                icon="wallet"
                                description="GoPay, OVO, Dana, ShopeePay"
                            />
                            <PaymentOption
                                type="QRIS"
                                label="QRIS"
                                icon="qrcode"
                                description="Scan with any banking app"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={() => onConfirm(selectedMethod)}
                            style={{ backgroundColor: COLORS.brandPrimary }}
                            labelStyle={{ fontSize: 16, paddingVertical: 4 }}
                        >
                            Confirm Purchase - {formatPrice(listing.price)}
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
        borderRadius: 8,
        marginBottom: 8,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    footer: {
        marginTop: 24,
    },
});
