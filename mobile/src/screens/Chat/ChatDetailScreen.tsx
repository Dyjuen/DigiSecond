import React, { useState, useRef, useEffect } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    ActivityIndicator
} from "react-native";
import { Text, TextInput, IconButton, useTheme, Menu } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TransactionChatHeader, { TransactionStatus } from "../../components/TransactionChatHeader";
import VerificationBanner from "../../components/VerificationBanner";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import { formatDate } from "../../utils/date";

interface Message {
    id: string;
    text?: string;
    image?: string;
    sentByMe: boolean;
    timestamp: string;
}

export default function ChatDetailScreen() {
    const theme = useTheme();
    const { id, username, mockStatus } = useLocalSearchParams<{ id: string; username: string; mockStatus?: string }>();
    const userId = useAuthStore((state) => state.user?.id);
    const [inputText, setInputText] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const utils = api.useUtils();

    // Queries
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = api.message.getByTransaction.useInfiniteQuery(
        { transaction_id: id, limit: 20 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            // Inverted list: newest messages are first in the list
        }
    );

    const messages = data?.pages.flatMap((page) => page.messages).map(msg => ({
        id: msg.message_id,
        text: msg.message_content,
        image: msg.attachment_url || undefined,
        sentByMe: msg.sender_user_id === userId,
        timestamp: formatDate(msg.created_at) // Using shared utility
    })) ?? [];

    // Mutations
    const sendMessageMutation = api.message.send.useMutation({
        onSuccess: () => {
            utils.message.getByTransaction.invalidate({ transaction_id: id });
            // Also invalidate unread counts
            utils.message.getAllUnreadCounts.invalidate();
        },
        onError: (error) => {
            Alert.alert("Error sending message", error.message);
        }
    });

    const markReadMutation = api.message.markRead.useMutation({
        onSuccess: () => {
            utils.message.getAllUnreadCounts.invalidate();
        }
    });

    // Realtime Subscription
    useEffect(() => {
        if (!id) return;

        const channel = supabase
            .channel(`transaction:${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                    filter: `transaction_id=eq.${id}`,
                },
                (payload) => {
                    // Invalidate to fetch new message
                    utils.message.getByTransaction.invalidate({ transaction_id: id });

                    // If we are looking at the screen, mark as read
                    // Simple timeout to allow fetch to complete or just fire-and-forget
                    markReadMutation.mutate({ transaction_id: id });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    // Mark read on mount
    useEffect(() => {
        if (id) {
            markReadMutation.mutate({ transaction_id: id });
        }
    }, [id]);

    // Actions
    const handleSend = () => {
        if (inputText.trim()) {
            sendMessageMutation.mutate({
                transaction_id: id,
                content: inputText.trim()
            });
            setInputText("");
        }
    };

    const pickImage = async () => {
        setMenuVisible(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true, // If we were uploading directly, but here we likely need to upload to Supabase first not implemented in this scope
        });

        if (!result.canceled && result.assets[0]) {
            // TODO: Implement image upload to Supabase storage, then send message with URL
            // For now, we can only send text as per backend mutation signature (it accepts attachment_url)
            // This would require a separate uploadPhoto procedure or client-side upload
            Alert.alert("Not Implemented", "Image upload requires setting up storage client side.");
        }
    };

    const takePhoto = async () => {
        setMenuVisible(false);
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission", "Camera permission is required.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
            Alert.alert("Not Implemented", "Image upload requires setting up storage client side.");
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.sentByMe ? styles.sentBubble : styles.receivedBubble,
                {
                    backgroundColor: item.sentByMe
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                },
            ]}
        >
            {item.image && (
                <Image
                    source={{ uri: item.image }}
                    style={styles.messageImage}
                    resizeMode="cover"
                    accessibilityLabel="Message attachment"
                />
            )}
            {item.text && (
                <Text
                    style={[
                        styles.messageText,
                        {
                            color: item.sentByMe
                                ? theme.colors.onPrimary
                                : theme.colors.onSurfaceVariant,
                        },
                    ]}
                >
                    {item.text}
                </Text>
            )}
            <Text
                style={[
                    styles.timestamp,
                    {
                        color: item.sentByMe
                            ? theme.colors.onPrimary
                            : theme.colors.onSurfaceVariant,
                        opacity: 0.7,
                    },
                ]}
            >
                {item.timestamp}
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Stack.Screen
                options={{
                    headerShown: !mockStatus, // Show default header if no status (unlikely)
                    title: username,
                }}
            />

            {mockStatus && (
                <View>
                    <TransactionChatHeader
                        partnerName={username}
                        listingTitle="Item Transaction" // ideally fetching transaction details to get this
                        listingPrice={0} // ideally fetching transaction details
                        status={mockStatus as TransactionStatus}
                    />
                    {/* Verification banner logic would go here if we fetched full transaction details */}
                </View>
            )}

            {isLoading ? (
                <View style={[styles.container, styles.center]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    inverted // Newest messages at bottom (visually), index 0 in data
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[styles.messagesList, { paddingBottom: 20 }]}
                    onEndReached={() => {
                        if (hasNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={15} // Optimization for initial load
                    ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 10 }} /> : null}
                />
            )}

            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme.colors.surface,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 16
                }
            ]}>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <IconButton
                            icon="camera"
                            iconColor={theme.colors.primary}
                            onPress={() => setMenuVisible(true)}
                        />
                    }
                    anchorPosition="top"
                >
                    <Menu.Item
                        onPress={takePhoto}
                        title="Take Photo"
                        leadingIcon="camera"
                    />
                    <Menu.Item
                        onPress={pickImage}
                        title="Choose from Gallery"
                        leadingIcon="image"
                    />
                </Menu>
                <TextInput
                    mode="outlined"
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                    style={styles.textInput}
                    outlineStyle={styles.textInputOutline}
                    dense
                    multiline
                    right={
                        <TextInput.Icon
                            icon="send"
                            onPress={handleSend}
                            disabled={!inputText.trim() || sendMessageMutation.isPending}
                        />
                    }
                />
            </View>
        </KeyboardAvoidingView>
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
    messagesList: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    sentBubble: {
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    receivedBubble: {
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        textAlign: "right",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    textInput: {
        flex: 1,
        marginRight: 4,
    },
    textInputOutline: {
        borderRadius: 24,
    },
});
