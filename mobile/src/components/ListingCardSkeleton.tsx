import React from "react";
import { StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { Skeleton } from "./Skeleton";
import { shadows } from "../lib/theme";

export function ListingCardSkeleton() {
    return (
        <Card style={[styles.card, shadows.shadowCard]}>
            <Skeleton height={150} style={styles.image} />
            <Card.Content style={styles.content}>
                <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={24} />
            </Card.Content>
            <Card.Actions>
                <Skeleton width={100} height={36} borderRadius={20} />
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        backgroundColor: "white",
    },
    image: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    content: {
        paddingVertical: 12,
    },
});
