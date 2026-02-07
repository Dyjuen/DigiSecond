import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, Text as NativeText } from "react-native";
import { Text, useTheme, Badge, Divider, IconButton, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";


// Helper for formatting date
import { formatDate } from "../../utils/date";

type TransactionStatus = "PENDING_PAYMENT" | "PAID" | "ITEM_TRANSFERRED" | "VERIFIED" | "COMPLETED" | "CANCELLED" | "DISPUTED" | "REFUNDED";

export default function ChatScreen() {
    const theme = useTheme();
    const router = useRouter();
    const userId = useAuthStore((state) => state.user?.id);

    // Fetch active transactions
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching
    } = api.transaction.getActive.useInfiniteQuery(
        { limit: 20 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            refetchOnMount: true,
        }
    );

    // Fetch unread counts
    const { data: unreadCounts } = api.message.getAllUnreadCounts.useQuery(undefined, {
        refetchInterval: 5000, // Poll every 5s for now, ideally use subscription or invalidate on push
    });

    const activeTransactions = data?.pages.flatMap((page) => page.transactions) ?? [];

    const handleConversationPress = (transaction: typeof activeTransactions[0], otherParty: { name: string, user_id: string }) => {
        router.push({
            pathname: "/chat/[id]",
            params: {
                id: transaction.transaction_id,
                username: otherParty.name,
                // We pass the status to the detail screen
                mockStatus: transaction.status
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_PAYMENT": return theme.colors.tertiary; // Use theme color for warning/pending if available, or fallback
            case "ITEM_TRANSFERRED": return theme.colors.primary;
            case "VERIFIED": return theme.colors.primary;
            case "PAID": return theme.colors.primary;
            case "COMPLETED": return theme.colors.primary;
            case "CANCELLED": return theme.colors.error;
            case "DISPUTED": return theme.colors.error;
            case "REFUNDED": return theme.colors.outline;
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const renderItem = ({ item }: { item: typeof activeTransactions[0] }) => {
        const isBuyer = item.buyer_id === userId;
        const otherParty = isBuyer ? item.seller : item.buyer;
        const unreadCount = unreadCounts ? unreadCounts[item.transaction_id] || 0 : 0;

        // Use listing title as the "last message" context for now
        const displayMessage = `Item: ${item.listing.title}`;

        return (
            <TouchableOpacity
                onPress={() => handleConversationPress(item, otherParty)}
                style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
            >
                <View>
                    <Image
                        source={{ uri: otherParty.avatar_url || "https://i.pravatar.cc/150" }}
                        style={styles.avatar}
                        accessibilityLabel={`${otherParty.name}'s avatar`}
                    />
                    <View style={styles.badgeContainer}>
                        <IconButton icon={isBuyer ? "shopping" : "store"} size={12} iconColor="white" style={styles.roleIcon} />
                    </View>
                </View>

                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                {otherParty.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    marginLeft: 8,
                                    color: theme.colors.primary,
                                    backgroundColor: theme.colors.secondaryContainer,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    overflow: 'hidden'
                                }}>
                                {isBuyer ? "SELLER" : "BUYER"}
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                    <View style={styles.messageRow}>
                        <View style={{ flex: 1 }}>
                            <NativeText
                                numberOfLines={1}
                                style={[
                                    styles.lastMessage,
                                    { color: unreadCount > 0 ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                                    unreadCount > 0 && styles.unreadMessage,
                                ]}
                            >
                                {displayMessage}
                            </NativeText>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <View style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: getStatusColor(item.status),
                                    marginRight: 6
                                }} />
                                <Text style={{ fontSize: 11, color: getStatusColor(item.status), fontWeight: 'bold' }}>
                                    {item.status.replace(/_/g, " ")}
                                </Text>
                            </View>
                        </View>

                        {unreadCount > 0 && (
                            <Badge style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                                {unreadCount}
                            </Badge>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={activeTransactions}
                keyExtractor={(item) => item.transaction_id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 10 }} /> : null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Belum ada percakapan aktif
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingBottom: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    conversationItem: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 12,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -4,
        right: 8,
        backgroundColor: '#6366f1', // brand-primary
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white'
    },
    roleIcon: {
        margin: 0,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    lastMessage: {
    },
    unreadMessage: {
        fontWeight: "600",
    },
    badge: {
        alignSelf: "center",
        marginLeft: 8,
    },
});
