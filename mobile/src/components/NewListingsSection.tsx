import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ListingCard } from "./ListingCard";
import { useRouter } from "expo-router";

import { useListingStore, CURRENT_USER_ID } from "../stores/listingStore";


export function NewListingsSection() {
    // Filter out own listings
    const listings = useListingStore((state) =>
        state.listings.filter(l => l.sellerId !== CURRENT_USER_ID)
    );
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
                {listings.map((item) => (
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
