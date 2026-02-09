import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, useTheme, Button, FAB, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { ListingCard } from "../../components/ListingCard";

export default function MyListingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { data: listings, isLoading, refetch, isRefetching } = api.listing.getByUser.useQuery({
        limit: 20,
        // Removed status filter - show all listings (PENDING, ACTIVE, etc.)
    });

    const handleCreate = () => {
        router.push("/listing/create");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isLoading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : !listings?.listings || listings.listings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                        Kamu belum menjual apapun.
                    </Text>
                    <Button mode="contained" onPress={handleCreate}>
                        Mulai Jualan
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={listings.listings}
                    keyExtractor={(item) => item.listing_id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={refetch}
                    refreshing={isRefetching}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <ListingCard
                                id={item.listing_id}
                                title={item.title}
                                price={item.price}
                                imageUrl={item.photo_urls?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                                onPress={() => {
                                    if (item.listing_type === 'AUCTION') {
                                        router.push(`/auction/${item.listing_id}`);
                                    } else {
                                        router.push(`/listing/${item.listing_id}`);
                                    }
                                }}
                                style={{ width: 160 }}
                            />
                        </View>
                    )}
                    numColumns={2}
                />
            )}

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={handleCreate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    itemContainer: {
        flex: 1,
        marginBottom: 16,
        alignItems: 'center', // Center cards in column
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
