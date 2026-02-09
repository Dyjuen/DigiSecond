import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type TransactionStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'ITEM_TRANSFERRED'
    | 'VERIFIED'
    | 'COMPLETED'
    | 'DISPUTED'
    | 'REFUNDED'
    | 'CANCELLED';

interface Props {
    status: TransactionStatus;
    verificationDeadline?: string | null;
    style?: ViewStyle;
}

export const TransactionProgressBar = ({ status, verificationDeadline, style }: Props) => {
    const theme = useTheme();

    // Define steps for digital goods
    const steps = [
        { key: 'PAID', label: 'Dibayar', icon: 'credit-card-check' },
        { key: 'ITEM_TRANSFERRED', label: 'Dikirim', icon: 'email-fast' },
        { key: 'VERIFIED', label: 'Selesai', icon: 'check-circle' }, // Merged Verified/Completed for UI simplicity usually, but let's stick to 3 main steps + complete
    ];

    // Map internal status to active step index
    let activeStep = -1;
    let isDisputed = false;
    let isCancelled = false;

    switch (status) {
        case 'PENDING_PAYMENT':
            activeStep = 0; // "Dibayar" is active (user needs to pay)
            break;
        case 'PAID':
            activeStep = 1; // "Dibayar" completed, "Dikirim" active (waiting for shipment)
            break;
        case 'ITEM_TRANSFERRED':
            activeStep = 2; // "Dikirim" completed, "Selesai" active (waiting for verification)
            break;
        case 'VERIFIED':
        case 'COMPLETED':
            activeStep = 3; // All completed
            break;
        case 'DISPUTED':
            isDisputed = true;
            activeStep = 1; // Stuck at transfer usually
            break;
        case 'REFUNDED':
        case 'CANCELLED':
            isCancelled = true;
            break;
    }

    if (isDisputed) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }, style]}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginLeft: 8 }}>
                        Dalam Dispute
                    </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Transaksi sedang ditinjau oleh tim kami. Mohon tunggu update selanjutnya.
                </Text>
            </View>
        );
    }

    if (isCancelled) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }, style]}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.onSurfaceVariant} />
                    <Text variant="titleMedium" style={{ marginLeft: 8 }}>
                        Dibatalkan
                    </Text>
                </View>
            </View>
        );
    }



    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;

                    let color = theme.colors.surfaceVariant;
                    if (isActive) color = theme.colors.primary;
                    if (isCompleted) color = theme.colors.primary;

                    return (
                        <React.Fragment key={step.key}>
                            {/* Step Item */}
                            <View style={styles.stepItem}>
                                <View style={[styles.iconContainer, { backgroundColor: isCompleted || isActive ? theme.colors.secondaryContainer : theme.colors.surfaceVariant }]}>
                                    <MaterialCommunityIcons
                                        name={step.icon as any}
                                        size={20}
                                        color={isCompleted || isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                    />
                                </View>
                                <Text
                                    variant="labelSmall"
                                    style={{
                                        color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        marginTop: 4
                                    }}
                                >
                                    {step.label}
                                </Text>
                            </View>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <View style={[
                                    styles.connector,
                                    { backgroundColor: index < activeStep ? theme.colors.primary : theme.colors.surfaceVariant }
                                ]} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>

            {/* status text helper */}
            {status === 'ITEM_TRANSFERRED' && verificationDeadline && (
                <View style={styles.infoContainer}>
                    <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.outline }}>
                        Konfirmasi otomatis dalam: {new Date(verificationDeadline).toLocaleDateString()} {new Date(verificationDeadline).toLocaleTimeString()}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connector: {
        flex: 1,
        height: 2,
        marginHorizontal: 8,
        marginTop: -16, // align with icon center roughly (icon is 32 + label text)
    },
    infoContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    }
});
