import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, useTheme, IconButton, HelperText } from "react-native-paper";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { api } from "../../lib/api";

export default function ReviewCreateScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = api.useUtils();

    const createReviewMutation = api.review.create.useMutation({
        onSuccess: () => {
            setIsSubmitting(false);
            utils.review.getByTransaction.invalidate({ transaction_id: transactionId });
            utils.transaction.getById.invalidate({ transaction_id: transactionId });
            Alert.alert("Success", "Review submitted successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            setIsSubmitting(false);
            Alert.alert("Error", error.message);
        }
    });

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert("Rating Required", "Please select a star rating.");
            return;
        }

        if (!transactionId) {
            Alert.alert("Error", "Transaction ID is missing");
            return;
        }

        setIsSubmitting(true);
        createReviewMutation.mutate({
            transaction_id: transactionId,
            rating: rating,
            comment: comment.trim() || undefined,
        });
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <IconButton
                    key={i}
                    icon={i <= rating ? "star" : "star-outline"}
                    iconColor={i <= rating ? theme.colors.primary : theme.colors.outline}
                    size={40}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                />
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Stack.Screen options={{ title: "Write a Review", headerBackTitle: "Back" }} />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                    <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                        How was your experience?
                    </Text>
                    <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Rate your transaction partner and let others know how cooperative they were.
                    </Text>

                    {renderStars()}
                    <HelperText type="error" visible={rating === 0 && isSubmitting}>
                        Please select a rating
                    </HelperText>

                    <TextInput
                        mode="outlined"
                        label="Comment (Optional)"
                        placeholder="They were very cooperative and fast..."
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                    contentStyle={{ paddingVertical: 8 }}
                >
                    Submit Review
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starButton: {
        margin: 0,
    },
    input: {
        width: '100%',
        marginTop: 16,
    },
    submitButton: {
        borderRadius: 8,
    }
});
