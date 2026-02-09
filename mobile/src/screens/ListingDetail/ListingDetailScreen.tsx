import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { Text, Button, Card, Avatar, Divider, useTheme, IconButton } from "react-native-paper";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Skeleton } from "../../components/Skeleton";
import { shadows } from "../../lib/theme";
import { api } from "../../lib/api";
import PaymentSheet from "../../components/PaymentSheet";

export default function ListingDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const theme = useTheme();

    // Sheet visibility states
    const [isPaymentSheetVisible, setPaymentSheetVisible] = useState(false);

    // Fetch listing from API
    const { data: listing, isLoading, error } = api.listing.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    // Auth & Mutations
    const utils = api.useUtils();
    const { data: session } = api.auth.getSession.useQuery();
    const deleteMutation = api.listing.delete.useMutation({
        onSuccess: () => {
            utils.listing.getByUser.invalidate();
            router.replace("/(tabs)/");
            Alert.alert("Deleted", "Listing has been removed");
        },
        onError: (err) => {
            Alert.alert("Error", err.message);
        }
    });

    const isOwner = session?.user?.id === listing?.seller_id;

    const handleDelete = () => {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to delete this listing?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate({ listingId: id as string })
                }
            ]
        );
    };

    const handleEdit = () => {
        router.push({ pathname: "/listing/edit/[id]", params: { id: id as string } });
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
                            <Button
                                mode="text"
                                style={{ marginLeft: "auto" }}
                                onPress={() => router.push({ pathname: "/seller/[id]", params: { id: listing.seller_id } })}
                            >
                                View
                            </Button>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <Button
                            mode="contained"
                            onPress={() => setPaymentSheetVisible(true)}
                            contentStyle={{ paddingVertical: 8 }}
                            style={{ flex: 1, marginTop: 0 }}
                        >
                            Buy Now
                        </Button>
                        <IconButton
                            icon="chat"
                            mode="contained"
                            containerColor={theme.colors.secondaryContainer}
                            iconColor={theme.colors.onSecondaryContainer}
                            size={24}
                            onPress={() => {
                                // Navigate to chat tab for now
                                router.push("/(tabs)/chat");
                            }}
                        />
                    </View>
                )}
            </View>

            <PaymentSheet
                visible={isPaymentSheetVisible}
                onDismiss={() => setPaymentSheetVisible(false)}
                listing={{
                    id: listing.listing_id,
                    title: listing.title,
                    price: listing.price,
                    sellerName: listing.seller.name || "Seller",
                    imageUrl: listing.photo_urls[0] // Pass image if available
                }}
                onSuccess={() => {
                    // PaymentSheet handles navigation to success, but we can do extra cleanup if needed
                    // or just let the sheet close itself/navigate
                }}
            />
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
