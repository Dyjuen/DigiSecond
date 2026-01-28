import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, useTheme, Badge, Divider } from "react-native-paper";
import { useRouter } from "expo-router";

// Dummy conversation data
const DUMMY_CONVERSATIONS = [
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
    },
    {
        id: "3",
        username: "ProGamer_ID",
        avatar: "https://i.pravatar.cc/150?u=progamer",
        lastMessage: "Bisa nego harganya?",
        timestamp: "1 hour ago",
        unread: 1,
    },
    {
        id: "4",
        username: "DigiCollector",
        avatar: "https://i.pravatar.cc/150?u=digicollector",
        lastMessage: "Thanks for the purchase! Enjoy the account 🎮",
        timestamp: "Yesterday",
        unread: 0,
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

interface Conversation {
    id: string;
    username: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
}

export default function ChatScreen() {
    const theme = useTheme();
    const router = useRouter();

    const handleConversationPress = (conversation: Conversation) => {
        router.push({
            pathname: "/chat/[id]",
            params: { id: conversation.id, username: conversation.username },
        });
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            onPress={() => handleConversationPress(item)}
            style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                        {item.username}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.timestamp}
                    </Text>
                </View>
                <View style={styles.messageRow}>
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
        flex: 1,
        marginRight: 8,
    },
    unreadMessage: {
        fontWeight: "600",
    },
    badge: {
        alignSelf: "center",
    },
});
