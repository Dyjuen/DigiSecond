import React, { useRef } from "react";
import { StyleSheet, View, Image, Animated } from "react-native";
import { Text, Card, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { shadows } from "../lib/theme";

interface AuctionCardProps {
    id: string;
    title: string;
    currentBid: number;
    timeLeft: string;
    imageUrl: string;
    onPress: () => void;
}

export function AuctionCard({ title, currentBid, timeLeft, imageUrl, onPress }: AuctionCardProps) {
    const theme = useTheme();

    const scaleAnim = useRef(new Animated.Value(1)).current;

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

    const formattedBid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(currentBid);

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.shadowCard]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View>
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                    <Surface style={[styles.badge, { backgroundColor: theme.colors.error }]} elevation={2}>
                        <Text variant="labelSmall" style={styles.badgeText}>LIVE</Text>
                    </Surface>
                </View>
                <Card.Content style={styles.content}>
                    <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>
                    <View style={styles.bidInfo}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Current Bid</Text>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                            {formattedBid}
                        </Text>
                    </View>
                    <View style={[styles.timeContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSecondaryContainer} />
                        <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer, marginLeft: 4 }}>
                            {timeLeft}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </Animated.View >
    );
}

const styles = StyleSheet.create({
    card: {
        width: 160,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4, // for shadow
    },
    image: {
        height: 100,
        width: '100%',
        borderRadius: 12, // Card borderRadius is ignored by Image on Android usually, so matching it or using overflow hidden on Card
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    content: {
        padding: 8,
        paddingBottom: 12,
    },
    title: {
        height: 40,
        marginBottom: 8,
        fontWeight: '500',
    },
    bidInfo: {
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        borderRadius: 4,
        justifyContent: 'center',
    },
});
