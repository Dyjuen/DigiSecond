import React, { useState, useEffect } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    TextInput as NativeTextInput,
    Animated,
    Easing
} from "react-native";
import { Text, IconButton, useTheme, Menu, Button, Surface } from "react-native-paper";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransactionProgressBar, TransactionStatus } from "../../components/TransactionProgressBar";
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

export default function ChatDetailScreenV2() {
    const theme = useTheme();
    const { id, username, mockStatus } = useLocalSearchParams<{ id: string; username: string; mockStatus?: string }>();
    const userId = useAuthStore((state) => state.user?.id);
    const [inputText, setInputText] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const expandAnim = React.useRef(new Animated.Value(0)).current;
    const [contentHeight, setContentHeight] = useState(0);

    const insets = useSafeAreaInsets();
    const router = useRouter();
    const utils = api.useUtils();

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        Animated.timing(expandAnim, {
            toValue,
            duration: 300,
            useNativeDriver: false, // Height cannot use native driver
        }).start();
        setExpanded(!expanded);
    };

    const arrowRotation = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    const animatedHeightStyle = {
        height: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, contentHeight || 100],
        }),
        opacity: expandAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        }),
    };

    // Fetch full transaction details
    const { data: transaction, isLoading: isTransactionLoading, refetch: refetchTransaction } = api.transaction.getById.useQuery(
        { transaction_id: id },
        {
            enabled: !!id,
            refetchInterval: (query) => {
                const data = query.state.data;
                if (!data) return 5000;
                return ["COMPLETED", "CANCELLED", "REFUNDED"].includes(data.status as string) ? false : 3000;
            }
        }
    );

    // Determines if we should show legitimate status or fallback to mock
    const currentStatus = transaction?.status || (mockStatus as TransactionStatus);
    const isBuyer = userId === transaction?.buyer_id;

    // Fetch review status
    const { data: reviewStatus } = api.review.getByTransaction.useQuery(
        { transaction_id: id },
        { enabled: !!id && currentStatus === 'COMPLETED' }
    );

    // Queries
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isMessagesLoading
    } = api.message.getByTransaction.useInfiniteQuery(
        { transaction_id: id, limit: 20, sortOrder: 'older' },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            refetchInterval: 3000, // Poll every 3 seconds
        }
    );

    const messages = data?.pages.flatMap((page) => page.messages).map(msg => ({
        id: msg.message_id,
        text: msg.message_content,
        image: msg.attachment_url || undefined,
        sentByMe: msg.sender_user_id === userId,
        timestamp: formatDate(msg.created_at)
    })) ?? [];

    // Mutations
    const sendMessageMutation = api.message.send.useMutation({
        onSuccess: () => {
            utils.message.getByTransaction.invalidate({ transaction_id: id });
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

    const confirmReceivedMutation = api.transaction.confirmReceived.useMutation({
        onSuccess: () => {
            Alert.alert("Berhasil", "Transaksi selesai. Terima kasih!");
            utils.transaction.getById.invalidate({ transaction_id: id });
            refetchTransaction();
        },
        onError: (error) => {
            Alert.alert("Gagal", error.message);
        }
    });

    // Removed Supabase Realtime subscription to match Web implementation
    // and avoid Auth/JWT connection issues.

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
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
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

    const handleDispute = () => {
        // Use Type Assertion to bypass strict route typing if needed, 
        // though strictly speaking we should define the routes in a d.ts file.
        // For now, assuming standard Expo Router string paths work.
        router.push({
            pathname: "/dispute/create",
            params: { transactionId: id }
        } as any);
    };

    const handleConfirmReceived = () => {
        Alert.alert(
            "Konfirmasi Penerimaan",
            "Apakah Anda yakin barang sudah diterima dengan baik? Dana akan diteruskan ke penjual dan transaksi selesai.",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Ya, Terima Barang",
                    onPress: () => confirmReceivedMutation.mutate({ transaction_id: id })
                }
            ]
        );
    };

    const handleViewDispute = () => {
        if (transaction?.dispute?.dispute_id) {
            router.push({
                pathname: "/dispute/[disputeId]",
                params: { disputeId: transaction.dispute.dispute_id }
            } as any);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageBubble item={item} theme={theme} />
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Stack.Screen
                options={{
                    headerShown: false, // Always hide default header since we implement a custom one
                }}
            />

            {/* Custom Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 4,
                paddingVertical: 8,
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outlineVariant,
                paddingTop: insets.top,
            }}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primaryContainer, borderRadius: 20 }}>
                    <Text style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>{username?.charAt(0).toUpperCase() || "?"}</Text>
                </View>
                <Text variant="titleMedium" style={{ marginLeft: 12, flex: 1, fontWeight: 'bold' }}>{username}</Text>
                <IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />
            </View>

            {/* Header & Progress Bar Area */}
            <View>
                {transaction && (
                    <Surface style={{ margin: 16, borderRadius: 12, elevation: 2, backgroundColor: theme.colors.surface, overflow: 'hidden' }}>
                        <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
                            {/* Progress Bar (Always Visible) */}
                            <TransactionProgressBar
                                status={currentStatus as TransactionStatus}
                                verificationDeadline={transaction.verification_deadline?.toString()}
                                style={{ borderBottomWidth: 0, paddingBottom: 4 }}
                            />
                            <Animated.View style={{ transform: [{ rotate: arrowRotation }], alignSelf: 'center' }}>
                                <IconButton
                                    icon="chevron-down"
                                    size={20}
                                    style={{ margin: 0, height: 20 }}
                                    iconColor={theme.colors.onSurfaceVariant}
                                />
                            </Animated.View>
                        </TouchableOpacity>

                        <Animated.View style={[{ overflow: 'hidden' }, animatedHeightStyle]}>
                            <View
                                onLayout={(e) => {
                                    const height = e.nativeEvent.layout.height;
                                    if (height > 0 && height !== contentHeight) {
                                        setContentHeight(height);
                                    }
                                }}
                                style={{ position: 'absolute', width: '100%', top: 0 }}
                            >
                                {/* Item Info Summary */}
                                <View style={[styles.itemSummary]}>
                                    <Text variant="titleSmall">{transaction.listing.title}</Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                        IDR {transaction.transaction_amount.toLocaleString()}
                                    </Text>
                                </View>

                                {/* Review Button for Completed Transactions */}
                                {currentStatus === 'COMPLETED' && (
                                    <View style={styles.actionContainer}>
                                        {reviewStatus?.hasReviewed ? (
                                            <Button
                                                mode="outlined"
                                                disabled
                                                icon="check"
                                                style={{ width: '100%', borderColor: theme.colors.primary }}
                                                textColor={theme.colors.primary}
                                            >
                                                Review Terkirim
                                            </Button>
                                        ) : (
                                            <Button
                                                mode="contained"
                                                icon="star"
                                                buttonColor={theme.colors.primary}
                                                textColor={theme.colors.onPrimary}
                                                style={{ width: '100%' }}
                                                onPress={() => router.push({
                                                    pathname: "/review/create",
                                                    params: { transactionId: id }
                                                } as any)}
                                            >
                                                Beri Review
                                            </Button>
                                        )}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </Surface>
                )}



                {/* Dispute / Action Buttons */}
                {transaction && currentStatus === 'ITEM_TRANSFERRED' && isBuyer && !transaction.dispute && (
                    <View style={[styles.actionContainer, { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }]}>
                        <Button
                            mode="outlined"
                            textColor={theme.colors.error}
                            style={{ borderColor: theme.colors.error, flex: 1 }}
                            icon="alert-circle-outline"
                            onPress={handleDispute}
                        >
                            Komplain
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor={theme.colors.primary}
                            textColor={theme.colors.onPrimary}
                            style={{ flex: 1 }}
                            icon="check-circle-outline"
                            onPress={handleConfirmReceived}
                            loading={confirmReceivedMutation.isPending}
                            disabled={confirmReceivedMutation.isPending}
                        >
                            Konfirmasi
                        </Button>
                    </View>
                )}

                {/* View Active Dispute Button */}
                {transaction?.dispute && (
                    <View style={[styles.actionContainer, { backgroundColor: theme.colors.errorContainer }]}>
                        <Button
                            mode="text"
                            textColor={theme.colors.error}
                            icon="eye"
                            onPress={handleViewDispute}
                        >
                            Lihat Detail Dispute
                        </Button>
                    </View>
                )}
            </View>

            {isMessagesLoading ? (
                <View style={[styles.container, styles.center]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    inverted
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[styles.messagesList, { paddingBottom: 20 }]}
                    onEndReached={() => {
                        if (hasNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={15}
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
                <View style={[
                    styles.textInputWrapper,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outline,
                    }
                ]}>
                    <NativeTextInput
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        value={inputText}
                        onChangeText={setInputText}
                        style={[
                            styles.nativeInput,
                            {
                                color: theme.colors.onSurface,
                            }
                        ]}
                        multiline
                    />
                    <IconButton
                        icon="send"
                        onPress={handleSend}
                        disabled={!inputText.trim() || sendMessageMutation.isPending}
                        iconColor={theme.colors.primary}
                        size={24}
                    />
                </View>
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
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 24,
        paddingLeft: 16,
        paddingRight: 4,
        marginRight: 4,
        minHeight: 48, // Ensure minimum touch target
    },
    nativeInput: {
        flex: 1,
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
        // textAlignVertical: 'center', // Not strictly needed if multiline behavior is handled by container alignment, but good to have reset
    },
    itemSummary: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)', // slight subtle bg
    },
    actionContainer: {
        padding: 16,
        alignItems: 'center',
    }
});

const MessageBubble = ({ item, theme }: { item: Message; theme: any }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.messageBubble,
                item.sentByMe ? styles.sentBubble : styles.receivedBubble,
                {
                    backgroundColor: item.sentByMe ? theme.colors.primary : theme.colors.surfaceVariant,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
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
                            color: item.sentByMe ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
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
                        color: item.sentByMe ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                        opacity: 0.7,
                    },
                ]}
            >
                {item.timestamp}
            </Text>
        </Animated.View>
    );
};
