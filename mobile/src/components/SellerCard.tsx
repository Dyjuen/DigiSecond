import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Avatar, Button, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { shadows } from "../lib/theme";

interface SellerCardProps {
    sellerId: string;
    sellerName: string;
    isVerified?: boolean;
    style?: any;
}

export function SellerCard({ sellerId, sellerName, isVerified = false, style }: SellerCardProps) {
    const theme = useTheme();
    const router = useRouter();

    return (
        <Card style={[styles.card, shadows.shadowCard, style]}>
            <Card.Content style={styles.content}>
                <Avatar.Text
                    size={40}
                    label={sellerName.charAt(0).toUpperCase()}
                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                />
                <View style={styles.info}>
                    <Text variant="titleMedium">{sellerName}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                        {isVerified ? "Verified Seller" : "Seller"}
                    </Text>
                </View>
                <Button
                    mode="text"
                    style={{ marginLeft: "auto" }}
                    onPress={() => router.push({ pathname: "/seller/[id]", params: { id: sellerId } })}
                >
                    View
                </Button>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    info: {
        marginLeft: 12,
    },
});
