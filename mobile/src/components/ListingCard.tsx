import React, { useRef, useState } from "react";
import { StyleSheet, View, ViewStyle, Animated } from "react-native";
import { Text, Card, useTheme, IconButton } from "react-native-paper";
import { shadows } from "../lib/theme";

interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    onPress: () => void;
    style?: ViewStyle;
}

export function ListingCard({ title, price, imageUrl, onPress, style }: ListingCardProps) {
    const theme = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const heartScaleAnim = useRef(new Animated.Value(1)).current;
    const [isLiked, setIsLiked] = useState(false);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        Animated.sequence([
            Animated.spring(heartScaleAnim, {
                toValue: 1.2,
                useNativeDriver: true,
                speed: 30,
            }),
            Animated.spring(heartScaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 30,
            }),
        ]).start();
    };

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

    return (
        <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
            <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.shadowCard]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View>
                    {/* @ts-ignore - RNP typings mismatch for source */}
                    <Card.Cover source={{ uri: imageUrl }} style={styles.image} />
                    <Animated.View style={[styles.favoriteButtonWrapper, { transform: [{ scale: heartScaleAnim }] }]}>
                        <IconButton
                            icon={isLiked ? "heart" : "heart-outline"}
                            iconColor={isLiked ? theme.colors.error : "white"}
                            size={20}
                            style={styles.favoriteButton}
                            onPress={toggleLike}
                        />
                    </Animated.View>
                </View>
                <Card.Content style={styles.content}>
                    {/* @ts-ignore - RNP typings mismatch for numberOfLines */}
                    <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                        {formattedPrice}
                    </Text>
                    <View style={styles.sellerInfo}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Jakarta</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}> • 5.0</Text>
                    </View>
                </Card.Content>
            </Card>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 6,
        borderRadius: 8,
        overflow: 'hidden'
    },
    image: {
        height: 140,
        borderRadius: 0,
    },
    favoriteButtonWrapper: {
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 1,
    },
    favoriteButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        margin: 0,
    },
    content: {
        padding: 8,
        paddingBottom: 12,
    },
    title: {
        marginBottom: 4,
        height: 40, // consistent height for 2 lines
    },
    sellerInfo: {
        flexDirection: 'row',
        marginTop: 4,
        alignItems: 'center'
    }
});
