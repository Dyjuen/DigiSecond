import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, useTheme, ActivityIndicator, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { api as trpc } from "../../lib/api";
import { ListingCard } from "../../components/ListingCard";
import { HomeHeader } from "../../components/HomeHeader";

export default function WishlistScreen() {
    const theme = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = trpc.wishlist.getUserWishlist.useInfiniteQuery(
        { limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    // Refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleEndReached = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const items = data?.pages.flatMap((page) => page.items) || [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
            <HomeHeader
                title="Wishlist Saya"
                onBack={() => router.back()}
            />

            {isLoading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : isError ? (
                <View style={styles.centerContainer}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
                        Gagal memuat wishlist.
                    </Text>
                    <FAB
                        icon="refresh"
                        style={styles.retryButton}
                        onPress={() => refetch()}
                        label="Coba Lagi"
                    />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                        Wishlist Kosong
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Anda belum menambahkan item ke wishlist.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    key={2} // Force fresh render for numColumns
                    numColumns={2}
                    keyExtractor={(item) => item.wishlist_id} // Use wishlist_id as key
                    renderItem={({ item }) => (
                        <ListingCard
                            id={item.listing_id}
                            title={item.title}
                            price={item.price}
                            imageUrl={item.photo_urls[0] || "https://via.placeholder.com/150"}
                            game={item.game}
                            server="Global" // TODO: Add server to listing if available
                            rating={4.8} // TODO: Add seller rating to listing
                            soldCount={10} // TODO: Add sold count
                            onPress={() => router.push({
                                pathname: "/listing/[id]",
                                params: { id: item.listing_id }
                            })}
                            style={{ flex: 1 }}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} /> : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 10, // Reduced padding since cards have margin
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    retryButton: {
        marginTop: 16,
    }
});
