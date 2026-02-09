import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, RefreshControl, Alert } from "react-native";
import { Text, Button, Card, Avatar, Divider, useTheme, TextInput } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import { shadows } from "../../lib/theme";
import { api } from "../../lib/api";
import { Skeleton } from "../../components/Skeleton";
import { useAuctionCountdown } from "../../hooks/useAuctionCountdown";
import { SellerCard } from "../../components/SellerCard";

export default function AuctionDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const utils = api.useUtils();

    // Bid state
    const [bidAmount, setBidAmount] = useState("");

    // Fetch listing
    const { data: listing, isLoading, error, refetch } = api.listing.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const { data: session } = api.auth.getSession.useQuery();
    const isOwner = session?.user?.id === listing?.seller_id;

    // Countdown
    const timeLeft = useAuctionCountdown(listing?.auction_ends_at);
    const isEnded = !timeLeft || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0);

    // Mutations
    const placeBidMutation = api.listing.placeBid.useMutation({
        onSuccess: () => {
            utils.listing.getById.invalidate({ id: id as string });
            setBidAmount("");
            Alert.alert("Success", "Bid placed successfully!");
        },
        onError: (err) => {
            Alert.alert("Error", err.message);
        }
    });

    const finishAuctionMutation = api.listing.finishAuction.useMutation({
        onSuccess: () => {
            utils.listing.getById.invalidate({ id: id as string });
            Alert.alert("Success", "Auction finished successfully!");
        },
        onError: (err) => {
            Alert.alert("Error", err.message);
        }
    });

    const handlePlaceBid = () => {
        if (!bidAmount) return;
        const amount = parseInt(bidAmount.replace(/\D/g, ""));

        if (amount <= (listing?.current_bid || listing?.starting_bid || 0)) {
            Alert.alert("Invalid Bid", "Bid amount must be higher than current bid");
            return;
        }

        Alert.alert(
            "Confirm Bid",
            `Place bid of ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: () => placeBidMutation.mutate({ listingId: id as string, amount })
                }
            ]
        );
    };

    const handleFinishAuction = () => {
        Alert.alert(
            "Finish Auction",
            "Are you sure you want to end this auction early?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    style: "destructive",
                    onPress: () => finishAuctionMutation.mutate({ listingId: id as string })
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: "Loading...", headerBackTitle: "Back" }} />
                <Skeleton height={250} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
                <View style={styles.content}>
                    <Skeleton width="80%" height={32} style={{ marginBottom: 12 }} />
                    <Skeleton width="40%" height={24} style={{ marginBottom: 24 }} />
                </View>
            </View>
        );
    }

    if (error || !listing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ title: "Error", headerBackTitle: "Back" }} />
                <Text>Error loading auction</Text>
            </View>
        );
    }

    const formatIDR = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
    const imageUrl = listing.photo_urls?.[0] || 'https://via.placeholder.com/400x300';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: "Auction Details", headerBackTitle: "Back" }} />
            <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
                <Image source={{ uri: imageUrl }} style={[styles.image, { backgroundColor: theme.colors.surfaceVariant }]} />

                <View style={styles.content}>
                    <Text variant="headlineSmall" style={styles.title}>{listing.title}</Text>

                    <Card style={[styles.countdownCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ textAlign: "center", color: theme.colors.onTertiaryContainer }}>
                                {isEnded ? "Auction Ended" : `Ends in: ${timeLeft?.days}d ${timeLeft?.hours}h ${timeLeft?.minutes}m ${timeLeft?.seconds}s`}
                            </Text>
                        </Card.Content>
                    </Card>

                    <View style={styles.priceSection}>
                        <View>
                            <Text variant="labelMedium">Current Bid</Text>
                            <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                                {formatIDR(listing.current_bid || listing.starting_bid || 0)}
                            </Text>
                        </View>
                        {listing.buy_now_price && (
                            <View>
                                <Text variant="labelMedium">Buy Now</Text>
                                <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>
                                    {formatIDR(listing.buy_now_price)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    <SellerCard
                        sellerId={listing.seller_id}
                        sellerName={listing.seller.name}
                        isVerified={listing.seller.is_verified}
                        style={styles.card}
                    />

                    <Divider style={styles.divider} />

                    <Text variant="titleMedium">Description</Text>
                    <Text variant="bodyMedium" style={{ marginTop: 8 }}>{listing.description}</Text>

                    <Divider style={styles.divider} />

                    <Text variant="titleMedium" style={{ marginBottom: 12 }}>Bid History</Text>
                    {listing.bids && listing.bids.length > 0 ? (
                        listing.bids.map((bid) => (
                            <View key={bid.bid_id} style={[styles.row, { marginBottom: 8 }]}>
                                <Avatar.Text size={32} label={bid.bidder.name[0]?.toUpperCase() || "?"} style={{ marginRight: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <Text variant="bodyMedium">{bid.bidder.name}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                        {new Date(bid.created_at).toLocaleString()}
                                    </Text>
                                </View>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                                    {formatIDR(bid.bid_amount)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ fontStyle: "italic", color: theme.colors.outline }}>No bids yet. Be the first!</Text>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
                {isOwner ? (
                    <Button
                        mode="contained"
                        onPress={handleFinishAuction}
                        loading={finishAuctionMutation.isPending}
                        buttonColor={theme.colors.error}
                        disabled={finishAuctionMutation.isPending || listing.status !== "ACTIVE"}
                    >
                        {listing.status === "ACTIVE" ? "End Auction Early" : "Auction Ended"}
                    </Button>
                ) : (
                    <View style={styles.bidInputContainer}>
                        <TextInput
                            mode="outlined"
                            label="Your Bid"
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            style={{ flex: 1, backgroundColor: theme.colors.surface }}
                            right={<TextInput.Affix text="IDR" />}
                            disabled={isEnded}
                            {...({ keyboardType: 'numeric' } as any)}
                        />
                        <Button
                            mode="contained"
                            onPress={handlePlaceBid}
                            loading={placeBidMutation.isPending}
                            disabled={isEnded || placeBidMutation.isPending || !bidAmount}
                            style={{ marginLeft: 12, justifyContent: "center", height: 50 }}
                            contentStyle={{ height: 50 }}
                        >
                            Place Bid
                        </Button>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    image: { width: "100%", height: 250 },
    content: { padding: 16 },
    title: { marginBottom: 12, fontWeight: "bold" },
    countdownCard: { marginBottom: 24 },
    priceSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    card: { marginBottom: 24 },
    row: { flexDirection: "row", alignItems: "center" },
    divider: { marginVertical: 16 },
    footer: { padding: 16, borderTopWidth: 1 },
    bidInputContainer: { flexDirection: "row", alignItems: "center" }
});
