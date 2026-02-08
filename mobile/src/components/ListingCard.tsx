import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, ViewStyle, Animated, TouchableOpacity } from "react-native";
import { Text, Card, useTheme, IconButton } from "react-native-paper";
import { shadows } from "../lib/theme";
import { useHaptic } from "../hooks/useHaptic";
import { api as trpc } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    onPress: () => void;
    style?: ViewStyle;
    // Optional props for optimistic updates or passing down data
    isWishlistedInitial?: boolean;
    game?: string;
    server?: string;
    rating?: number;
    soldCount?: number;
}

export function ListingCard({
    id,
    title,
    price,
    imageUrl,
    onPress,
    style,
    isWishlistedInitial = false,
    game,
    server,
    rating,
    soldCount
}: ListingCardProps) {
    const theme = useTheme();
    const { user } = useAuthStore();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const heartScaleAnim = useRef(new Animated.Value(1)).current;
    const haptics = useHaptic();

    // Optimistic state
    const [isLiked, setIsLiked] = useState(isWishlistedInitial);

    // TRPC Utils
    const utils = trpc.useUtils();

    // Check initial status if logged in
    const { data: checkData } = trpc.wishlist.check.useQuery(
        { listingId: id },
        {
            enabled: !!user,
            staleTime: 5 * 60 * 1000, // Cache for 5 mins
        }
    );

    useEffect(() => {
        if (checkData) {
            setIsLiked(checkData.isWishlisted);
        }
    }, [checkData]);

    const toggleMutation = trpc.wishlist.toggle.useMutation({
        onMutate: async () => {
            // Cancel outgoing refetches
            await utils.wishlist.check.cancel({ listingId: id });
            await utils.wishlist.getUserWishlist.cancel();

            // Snapshot previous value
            const previousState = isLiked;

            // Optimistically update
            setIsLiked(!previousState);

            return { previousState };
        },
        onError: (err, newTodo, context) => {
            // Rollback
            if (context?.previousState !== undefined) {
                setIsLiked(context.previousState);
            }
        },
        onSettled: () => {
            // Invalidate to ensure sync
            utils.wishlist.check.invalidate({ listingId: id });
            utils.wishlist.getUserWishlist.invalidate();
        }
    });

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
        if (!user) {
            // TODO: Navigate to login or show toast
            return;
        }

        haptics.trigger('medium');
        toggleMutation.mutate({ listingId: id });

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
                    {/* @ts-expect-error - RNP typings mismatch for source */}
                    <Card.Cover source={{ uri: imageUrl }} style={styles.image} />
                    <Animated.View style={[styles.favoriteButtonWrapper, { transform: [{ scale: heartScaleAnim }] }]}>
                        <TouchableOpacity
                            style={[styles.favoriteButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                            onPress={toggleLike}
                        >
                            <IconButton
                                icon={isLiked ? "heart" : "heart-outline"}
                                iconColor={isLiked ? theme.colors.error : "white"}
                                size={20}
                                style={{ margin: 0 }}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
                <Card.Content style={styles.content}>
                    {/* @ts-expect-error - RNP typings mismatch for numberOfLines */}
                    <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>
                    {game && (
                        <Text variant="labelSmall" style={{ color: theme.colors.primary, marginBottom: 2 }}>
                            {game}
                        </Text>
                    )}
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                        {formattedPrice}
                    </Text>
                    <View style={styles.sellerInfo}>
                        {server && <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 4 }}>{server}</Text>}
                        {rating && <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>★ {rating}</Text>}
                        {soldCount !== undefined && <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}> • {soldCount} Terjual</Text>}
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
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
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
        alignItems: 'center',
        flexWrap: 'wrap'
    }
});
