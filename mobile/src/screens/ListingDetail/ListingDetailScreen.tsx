import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, Card, Avatar, Divider, useTheme } from "react-native-paper";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Skeleton } from "../../components/Skeleton";
import { shadows } from "../../lib/theme";
import { Alert } from "react-native";
import { api } from "../../lib/api";

export default function ListingDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const theme = useTheme();

    // Fetch listing from API
    const { data: listing, isLoading, error } = api.listing.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const isOwner = false; // TODO: Check against actual user ID when auth is implemented

    const handleDelete = () => {
        // TODO: Will use api.listing.delete.useMutation() when auth is implemented
        Alert.alert("Not Implemented", "Delete requires authentication");
    };

    const handleEdit = () => {
        // TODO: Navigate to edit screen when auth is implemented
        router.push(`/listing/create?id=${id}`);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: "Loading...", headerBackTitle: "Back" }} />
                <Skeleton height={250} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
                <View style={styles.content}>
                    <Skeleton width="80%" height={32} style={{ marginBottom: 12 }} />
                    <Skeleton width="40%" height={24} style={{ marginBottom: 24 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
                        <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                        <View>
                            <Skeleton width={100} height={16} style={{ marginBottom: 4 }} />
                            <Skeleton width={60} height={12} />
                        </View>
                    </View>
                    <Skeleton width="100%" height={100} />
                </View>
            </View>
        );
    }

    if (error || !listing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: "Not Found", headerBackTitle: "Back" }} />
                <Text variant="headlineMedium">{error ? "Error loading listing" : "Listing not found"}</Text>
                {error && <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.error }}>{error.message}</Text>}
            </View>
        );
    }

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(listing.price);

    // Get first photo or use placeholder
    const imageUrl = 'https://via.placeholder.com/400x300'; // TODO: Backend needs to include photos in response

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: "Details", headerBackTitle: "Back" }} />
            <ScrollView>
                <Image source={{ uri: imageUrl }} style={[styles.image, { backgroundColor: theme.colors.surfaceVariant }]} alt={listing.title} />

                <View style={styles.content}>
                    <Text variant="headlineSmall" style={styles.title}>
                        {listing.title}
                    </Text>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "bold", marginBottom: 16 }}>
                        {formattedPrice}
                    </Text>

                    <Card style={[styles.sellerCard, shadows.shadowCard]}>
                        <Card.Content style={styles.sellerContent}>
                            <Avatar.Text
                                size={40}
                                label={listing.seller.name.charAt(0).toUpperCase()}
                                style={{ backgroundColor: theme.colors.secondaryContainer }}
                            />
                            <View style={styles.sellerInfo}>
                                <Text variant="titleMedium">{listing.seller.name}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                                    {listing.seller.is_verified ? "Verified Seller" : "Seller"}
                                </Text>
                            </View>
                            <Button mode="text" style={{ marginLeft: "auto" }}>View</Button>
                        </Card.Content>
                    </Card>

                    <Divider style={styles.divider} />

                    <Text variant="titleMedium" style={{ marginBottom: 8 }}>Description</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {listing.description}
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
                {isOwner ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <Button
                            mode="outlined"
                            onPress={handleDelete}
                            textColor={theme.colors.error}
                            style={{ flex: 1, borderColor: theme.colors.error }}
                        >
                            Delete
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={handleEdit}
                            style={{ flex: 1 }}
                        >
                            Edit
                        </Button>
                    </View>
                ) : (
                    <Button mode="contained" onPress={() => alert("Login required to purchase")} contentStyle={{ paddingVertical: 8 }} style={{ marginTop: 0 }}>
                        Buy Now
                    </Button>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: 250,
    },
    content: {
        padding: 16,
    },
    title: {
        marginBottom: 8,
        fontWeight: "bold",
    },
    sellerCard: {
        marginBottom: 24,
    },
    sellerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    sellerInfo: {
        marginLeft: 12,
    },
    divider: {
        marginBottom: 24,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
});
