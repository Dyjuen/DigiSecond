import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ListingCard } from "./ListingCard";
import { useRouter } from "expo-router";

// Mock Data (Moved from ListingsScreen)
const MOCK_LISTINGS = [
    {
        id: "1",
        title: "Mobile Legends Mythic Account - Max Embols",
        price: 1500000,
        imageUrl: "https://picsum.photos/400/300?random=1",
        description: "High winrate, many skins. Safe transaction guaranteed.",
    },
    {
        id: "2",
        title: "Genshin Impact AR 60 - All Archons",
        price: 3500000,
        imageUrl: "https://picsum.photos/400/300?random=2",
        description: "Day 1 account, well maintained. All archons C0.",
    },
    {
        id: "3",
        title: "Valorant Radiant Account - Vandal Skin",
        price: 850000,
        imageUrl: "https://picsum.photos/400/300?random=3",
        description: "Radiant buddy, reaver vandal. Email modifiable.",
    },
    {
        id: "4",
        title: "Steam Types - 100+ Games",
        price: 2000000,
        imageUrl: "https://picsum.photos/400/300?random=4",
        description: "CS2 Prime, GTA V, RDR2. No bans.",
    },
    {
        id: "5",
        title: "Roblox Account 2010 - Rare Hat",
        price: 500000,
        imageUrl: "https://picsum.photos/400/300?random=5",
        description: "Vintage account with verifying email.",
    },
];

export function NewListingsSection() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Listing Terbaru</Text>
                <TouchableOpacity>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Lihat Semua</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {MOCK_LISTINGS.map((item) => (
                    <ListingCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        onPress={() => router.push(`/listing/${item.id}`)}
                        style={styles.card}
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
        paddingHorizontal: 16,
        paddingBottom: 8, // space for shadow
    },
    card: {
        width: 160,
        marginRight: 12, // override default margin
        margin: 0, // reset other margins
        marginLeft: 0,
    }
});
