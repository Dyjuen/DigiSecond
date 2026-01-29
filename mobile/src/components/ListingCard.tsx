import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Card, useTheme, IconButton } from "react-native-paper";
import { shadows } from "../lib/theme";

interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    onPress: () => void;
    style?: any;
}

export function ListingCard({ title, price, imageUrl, onPress, style }: ListingCardProps) {
    const theme = useTheme();

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.shadowCard, style]} onPress={onPress}>
            <View>
                <Card.Cover source={{ uri: imageUrl }} style={styles.image} />
                <IconButton
                    icon="heart-outline"
                    iconColor="white"
                    size={20}
                    style={styles.favoriteButton}
                    onPress={() => { }}
                />
            </View>
            <Card.Content style={styles.content}>
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
    favoriteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
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
