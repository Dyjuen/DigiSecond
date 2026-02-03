import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AuctionCard } from "./AuctionCard";
import { api } from "../lib/api";
import { useAuctionCountdown } from "../hooks/useAuctionCountdown";

// Separate component to use hook per auction
function AuctionItem({ auction }: { auction: any }) {
    const { timeLeft, isUrgent } = useAuctionCountdown(auction.auction_ends_at);

    return (
        <AuctionCard
            id={auction.listing_id}
            title={auction.title}
            currentBid={auction.current_bid || auction.price}
            timeLeft={timeLeft}
            imageUrl="https://via.placeholder.com/400x300"
            onPress={() => console.log(`Pressed Auction ${auction.listing_id}`)}
            isUrgent={isUrgent}
        />
    );
}

export function AuctionsSection() {
    const theme = useTheme();

    // Fetch auction listings from API
    const { data, isLoading } = api.listing.getAll.useQuery({
        type: "AUCTION",
        sortBy: "newest",
        limit: 6,
        page: 1,
    });

    const auctions = data?.listings || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Lelang Langsung</Text>
                <TouchableOpacity>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Lihat Semua</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 16 }} />
                ) : auctions.length === 0 ? (
                    <Text variant="bodyMedium" style={{ marginLeft: 16, color: theme.colors.onSurfaceVariant }}>
                        Tidak ada lelang aktif
                    </Text>
                ) : (
                    auctions.map((auction) => (
                        <AuctionItem key={auction.listing_id} auction={auction} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    scrollContent: {
        paddingHorizontal: 16
    },
});
