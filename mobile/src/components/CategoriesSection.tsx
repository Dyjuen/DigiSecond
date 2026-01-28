import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { CategoryCard } from "./CategoryCard";

// Mock Data based on spec.md
const CATEGORIES = [
    { id: 1, title: "Mobile Legends", image: "https://picsum.photos/400/300?random=10" },
    { id: 2, title: "Genshin Impact", image: "https://picsum.photos/400/300?random=11" },
    { id: 3, title: "Valorant", image: "https://picsum.photos/400/300?random=12" },
    { id: 4, title: "Roblox", image: "https://picsum.photos/400/300?random=13" },
    { id: 5, title: "Free Fire", image: "https://picsum.photos/400/300?random=14" },
];

export function CategoriesSection() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Kategori Game</Text>
                <TouchableOpacity>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Lihat Semua</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        title={category.title}
                        imageUrl={category.image}
                        onPress={() => console.log(`Pressed ${category.title}`)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
});
