import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Avatar, ActivityIndicator, useTheme, Divider, List } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { api } from '../../lib/api';
import { format } from 'date-fns';

export default function SellerProfileScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();

    const { data: profile, isLoading: isLoadingProfile } = api.user.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const { data: ratingSummary, isLoading: isLoadingStats } = api.review.getRatingSummary.useQuery(
        { user_id: id as string },
        { enabled: !!id }
    );

    const { data: reviewsData, isLoading: isLoadingReviews } = api.review.getByUser.useQuery(
        { user_id: id as string, limit: 10 },
        { enabled: !!id }
    );

    if (isLoadingProfile || isLoadingStats) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text>User not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: profile.name }} />

            <View style={styles.header}>
                <Avatar.Image
                    size={80}
                    source={{ uri: profile.avatar_url || 'https://via.placeholder.com/80' }}
                />
                <Text variant="headlineSmall" style={styles.name}>{profile.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                    Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text variant="titleLarge">{ratingSummary?.average.toFixed(1) || '0.0'}</Text>
                    <Text variant="bodySmall">Rating</Text>
                </View>
                <View style={styles.statItem}>
                    <Text variant="titleLarge">{ratingSummary?.count || 0}</Text>
                    <Text variant="bodySmall">Reviews</Text>
                </View>
                <View style={styles.statItem}>
                    <Text variant="titleLarge">{profile.role}</Text>
                    <Text variant="bodySmall">Role</Text>
                </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Reviews</Text>
                {reviewsData?.reviews.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>No reviews yet</Text>
                ) : (
                    reviewsData?.reviews.map((review) => (
                        <List.Item
                            key={review.review_id}
                            title={review.reviewer.name}
                            description={review.comment}
                            left={props => <Avatar.Image {...props} size={40} source={{ uri: review.reviewer.avatar_url || 'https://via.placeholder.com/40' }} />}
                            right={props => (
                                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{review.rating}</Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}> ★</Text>
                                    </View>
                                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>{format(new Date(review.created_at), 'dd MMM yyyy')}</Text>
                                </View>
                            )}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 24 },
    name: { marginTop: 12, fontWeight: 'bold' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 24 },
    statItem: { alignItems: 'center' },
    divider: { height: 1 },
    section: { padding: 16 },
    sectionTitle: { marginBottom: 12, fontWeight: 'bold' },
});
