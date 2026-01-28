import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, Card, Avatar, Divider, useTheme } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import { MOCK_LISTINGS } from "../Listings/ListingsScreen";
import { Skeleton } from "../../components/Skeleton";
import { shadows } from "../../lib/theme";

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState<typeof MOCK_LISTINGS[0] | null>(null);

    useEffect(() => {
        // Simulate fetching data
        setLoading(true);
        setTimeout(() => {
            const found = MOCK_LISTINGS.find((l) => l.id === id);
            setListing(found || null);
            setLoading(false);
        }, 1500);
    }, [id]);

    if (loading) {
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

    if (!listing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: "Not Found", headerBackTitle: "Back" }} />
                <Text variant="headlineMedium">Listing not found</Text>
            </View>
        );
    }

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(listing.price);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: "Details", headerBackTitle: "Back" }} />
            <ScrollView>
                <Image source={{ uri: listing.imageUrl }} style={styles.image} alt={listing.title} />

                <View style={styles.content}>
                    <Text variant="headlineSmall" style={styles.title}>
                        {listing.title}
                    </Text>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "bold", marginBottom: 16 }}>
                        {formattedPrice}
                    </Text>

                    <Card style={[styles.sellerCard, shadows.shadowCard]}>
                        <Card.Content style={styles.sellerContent}>
                            <Avatar.Text size={40} label="S" style={{ backgroundColor: theme.colors.secondaryContainer }} />
                            <View style={styles.sellerInfo}>
                                <Text variant="titleMedium">Seller Name</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Verified Seller</Text>
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
                <Button mode="contained" onPress={() => alert("Proceed to Payment")} contentStyle={{ paddingVertical: 8 }}>
                    Buy Now
                </Button>
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
        backgroundColor: "#eee",
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
        backgroundColor: "white",
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
