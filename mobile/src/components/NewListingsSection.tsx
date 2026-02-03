import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ListingCard } from "./ListingCard";
import { useRouter } from "expo-router";
import { api } from "../lib/api";

export function NewListingsSection() {
    const theme = useTheme();
    const router = useRouter();

    // Fetch new listings from API
    const { data, isLoading } = api.listing.getAll.useQuery({
        sortBy: "newest",
        limit: 6,
        page: 1,
    });

    const listings = data?.listings || [];

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
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 16 }} />
                ) : listings.length === 0 ? (
                    <Text variant="bodyMedium" style={{ marginLeft: 16, color: theme.colors.onSurfaceVariant }}>
                        Tidak ada listing baru
                    </Text>
                ) : (
                    listings.map((item) => (
                        <ListingCard
                            key={item.listing_id}
                            id={item.listing_id}
                            title={item.title}
                            price={item.price}
                            imageUrl="https://via.placeholder.com/400x300"
                            onPress={() => router.push(`/listing/${item.listing_id}`)}
                            style={styles.card}
                        />
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
