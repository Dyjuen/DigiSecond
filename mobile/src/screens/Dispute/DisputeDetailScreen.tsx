import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, useTheme, Chip, Button, Divider, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import { api } from "../../lib/api";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DisputeDetailScreen() {
    const theme = useTheme();
    const { disputeId } = useLocalSearchParams<{ disputeId: string }>();

    const { data: dispute, isLoading } = api.dispute.getById.useQuery({ id: disputeId });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!dispute) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text>Dispute tidak ditemukan</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: "Detail Dispute" }} />

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        {dispute.dispute_category.replace(/_/g, " ")}
                    </Text>
                    <Chip
                        icon={dispute.status === 'RESOLVED' ? 'check' : 'alert-circle-outline'}
                        mode="outlined"
                        style={{ borderColor: dispute.status === 'RESOLVED' ? theme.colors.primary : theme.colors.error }}
                    >
                        {dispute.status}
                    </Chip>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    ID: {dispute.dispute_id}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={styles.cardTitle}>Item Transaksi</Text>
                <View style={styles.itemRow}>
                    <Image
                        source={{ uri: dispute.transaction.listing.photo_urls[0] || "https://placehold.co/100" }}
                        style={styles.itemImage}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{dispute.transaction.listing.title}</Text>
                        <Text variant="bodyMedium">IDR {dispute.transaction.transaction_amount.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={styles.cardTitle}>Detail Laporan</Text>
                <View style={[styles.userRow, { marginBottom: 12 }]}>
                    <Image
                        source={{ uri: dispute.initiator.avatar_url || "https://i.pravatar.cc/150" }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{dispute.initiator.name}</Text>
                        <Text variant="bodySmall">Pelapor</Text>
                    </View>
                </View>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                    {dispute.description}
                </Text>
            </View>

            {dispute.evidences.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="titleMedium" style={styles.cardTitle}>Bukti</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {dispute.evidences.map((ev) => (
                            <Image
                                key={ev.evidence_id}
                                source={{ uri: ev.file_url }}
                                style={styles.evidenceImage}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={[styles.infoBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialCommunityIcons name="information" size={20} color={theme.colors.onSecondaryContainer} />
                <Text variant="bodySmall" style={{ marginLeft: 8, flex: 1, color: theme.colors.onSecondaryContainer }}>
                    Admin sedang meninjau laporan ini. Keputusan admin bersifat mutlak. Anda akan menerima notifikasi saat ada update.
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 1,
    },
    cardTitle: {
        marginBottom: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    evidenceImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 8,
    },
    infoBox: {
        margin: 16,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    }
});
