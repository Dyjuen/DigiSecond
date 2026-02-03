import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, useTheme, Badge, Divider, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

// Transaction Status Type
type TransactionStatus = "PENDING_PAYMENT" | "PAID" | "ITEM_TRANSFERRED" | "VERIFIED" | "COMPLETED" | "CANCELLED";

interface Conversation {
    id: string;
    username: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    // Transaction info (optional)
    transaction?: {
        status: TransactionStatus;
        label: string;
    };
}

// Dummy conversation data
const DUMMY_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        username: "GameMaster42",
        avatar: "https://i.pravatar.cc/150?u=gamemaster42",
        lastMessage: "Akun masih ada garansinya kan?",
        timestamp: "2 min ago",
        unread: 2,
    },
    {
        id: "2",
        username: "MLPlayer99",
        avatar: "https://i.pravatar.cc/150?u=mlplayer99",
        lastMessage: "Deal! Saya transfer sekarang",
        timestamp: "15 min ago",
        unread: 0,
        transaction: {
            status: "PENDING_PAYMENT",
            label: "AWAITING PAYMENT"
        }
    },
    {
        id: "3",
        username: "ProGamer_ID",
        avatar: "https://i.pravatar.cc/150?u=progamer",
        lastMessage: "Cek email ya, akun sudah dikirim",
        timestamp: "1 hour ago",
        unread: 1,
        transaction: {
            status: "ITEM_TRANSFERRED",
            label: "VERIFY ITEM"
        }
    },
    {
        id: "4",
        username: "DigiCollector",
        avatar: "https://i.pravatar.cc/150?u=digicollector",
        lastMessage: "Thanks for the purchase! Enjoy the account 🎮",
        timestamp: "Yesterday",
        unread: 0,
        transaction: {
            status: "COMPLETED",
            label: "COMPLETED"
        }
    },
    {
        id: "5",
        username: "TradeMaster",
        avatar: "https://i.pravatar.cc/150?u=trademaster",
        lastMessage: "Item sudah dikirim, cek email ya",
        timestamp: "2 days ago",
        unread: 0,
    },
];

export default function ChatScreen() {
    const theme = useTheme();
    const router = useRouter();

    const handleConversationPress = (conversation: Conversation) => {
        router.push({
            pathname: "/chat/[id]",
            params: {
                id: conversation.id,
                username: conversation.username,
                // Pass status to detail screen for mock purposes
                mockStatus: conversation.transaction?.status
            },
        });
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case "PENDING_PAYMENT": return "#f59e0b"; // warning
            case "ITEM_TRANSFERRED": return "#f59e0b"; // warning
            case "VERIFIED": return "#22c55e"; // success
            case "PAID": return "#22c55e"; // success
            case "COMPLETED": return "#22c55e"; // success
            case "CANCELLED": return "#ef4444"; // error
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            onPress={() => handleConversationPress(item)}
            style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
        >
            <View>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.transaction && (
                    <View style={styles.badgeContainer}>
                        <IconButton icon="cart" size={12} iconColor="white" style={styles.cartIcon} />
                    </View>
                )}
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                            {item.username}
                        </Text>
                        {item.transaction && (
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
                                BUYING
                            </Text>
                        )}
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.timestamp}
                    </Text>
                </View>
                <View style={styles.messageRow}>
                    <View style={{ flex: 1 }}>
                        <Text
                            variant="bodyMedium"
                            numberOfLines={1}
                            style={[
                                styles.lastMessage,
                                { color: item.unread > 0 ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                                item.unread > 0 && styles.unreadMessage,
                            ]}
                        >
                            {item.lastMessage}
                        </Text>

                        {/* Transaction Status Indicator */}
                        {item.transaction && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <View style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: getStatusColor(item.transaction.status),
                                    marginRight: 6
                                }} />
                                <Text style={{ fontSize: 11, color: getStatusColor(item.transaction.status), fontWeight: 'bold' }}>
                                    {item.transaction.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {item.unread > 0 && (
                        <Badge style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            {item.unread}
                        </Badge>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={DUMMY_CONVERSATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 16,
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
    cartIcon: {
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
