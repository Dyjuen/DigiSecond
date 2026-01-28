import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { CategoriesSection } from "../../components/CategoriesSection";
import { AuctionsSection } from "../../components/AuctionsSection";
import { NewListingsSection } from "../../components/NewListingsSection";
import { useRouter } from "expo-router";

// Mock Data
export const MOCK_LISTINGS = [
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

export default function ListingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate network delay
        setTimeout(() => setLoading(false), 2000);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <CategoriesSection />
                <AuctionsSection />
                <NewListingsSection />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
});
