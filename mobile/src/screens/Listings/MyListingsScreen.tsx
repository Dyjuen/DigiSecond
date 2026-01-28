import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, useTheme, Button, FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import { useListingStore, CURRENT_USER_ID } from "../../stores/listingStore";
import { ListingCard } from "../../components/ListingCard";

export default function MyListingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const myListings = useListingStore((state) =>
        state.listings.filter(l => l.sellerId === CURRENT_USER_ID)
    );

    const handleCreate = () => {
        router.push("/listing/create");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {myListings.length === 0 ? (
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
                    data={myListings}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <ListingCard
                                id={item.id}
                                title={item.title}
                                price={item.price}
                                imageUrl={item.imageUrl}
                                onPress={() => router.push(`/listing/${item.id}`)}
                                style={{ width: 160 }} // Override width for grid-like feel or list
                            />
                            {/* In a real app we might want a row layout or delete button here directly */}
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
