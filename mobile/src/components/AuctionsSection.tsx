import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AuctionCard } from "./AuctionCard";

// Mock Data
const AUCTIONS = [
    {
        id: "a1",
        title: "Rare Genshin UID 8000...",
        currentBid: 550000,
        timeLeft: "02:15:30",
        image: "https://picsum.photos/400/300?random=20",
    },
    {
        id: "a2",
        title: "Valorant Knife Collection",
        currentBid: 1200000,
        timeLeft: "00:45:10",
        image: "https://picsum.photos/400/300?random=21",
    },
    {
        id: "a3",
        title: "MLBB Savage Account",
        currentBid: 300000,
        timeLeft: "05:00:00",
        image: "https://picsum.photos/400/300?random=22",
    },
];

export function AuctionsSection() {
    const theme = useTheme();

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
                {AUCTIONS.map((auction) => (
                    <AuctionCard
                        key={auction.id}
                        id={auction.id}
                        title={auction.title}
                        currentBid={auction.currentBid}
                        timeLeft={auction.timeLeft}
                        imageUrl={auction.image}
                        onPress={() => console.log(`Pressed Auction ${auction.id}`)}
                    />
                ))}
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
