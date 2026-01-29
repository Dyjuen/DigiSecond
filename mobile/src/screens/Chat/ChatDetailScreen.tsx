import React, { useState, useRef } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from "react-native";
import { Text, TextInput, IconButton, useTheme, Menu } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

interface Message {
    id: string;
    text?: string;
    image?: string;
    sentByMe: boolean;
    timestamp: string;
}

// Dummy messages
const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        text: "Halo, akun ML rank Mythic nya masih available?",
        sentByMe: false,
        timestamp: "10:30 AM",
    },
    {
        id: "2",
        text: "Masih kak! Hero komplit 120 skin epic++",
        sentByMe: true,
        timestamp: "10:31 AM",
    },
    {
        id: "3",
        text: "Wah mantap! Bisa liat screenshot skin nya?",
        sentByMe: false,
        timestamp: "10:32 AM",
    },
    {
        id: "4",
        image: "https://placehold.co/300x200/22c55e/white?text=Hero+Collection",
        sentByMe: true,
        timestamp: "10:33 AM",
    },
    {
        id: "5",
        text: "Lengkap banget! Akun masih ada garansinya kan?",
        sentByMe: false,
        timestamp: "10:35 AM",
    },
];

export default function ChatDetailScreen() {
    const theme = useTheme();
    useLocalSearchParams<{ id: string; username: string }>();
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = (text?: string, image?: string) => {
        if (!text && !image) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            image,
            sentByMe: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleSend = () => {
        if (inputText.trim()) {
            sendMessage(inputText.trim());
        }
    };

    const pickImage = async () => {
        setMenuVisible(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            sendMessage(undefined, result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        setMenuVisible(false);
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Denied", "Camera permission is required to take photos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            sendMessage(undefined, result.assets[0].uri);
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
                <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
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
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
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
                    right={
                        <TextInput.Icon
                            icon="send"
                            onPress={handleSend}
                            disabled={!inputText.trim()}
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
    messagesList: {
        padding: 16,
        paddingBottom: 8,
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
