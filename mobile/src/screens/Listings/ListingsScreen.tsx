import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { CategoriesSection } from "../../components/CategoriesSection";
import { AuctionsSection } from "../../components/AuctionsSection";
import { NewListingsSection } from "../../components/NewListingsSection";



export default function ListingsScreen() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <CategoriesSection />
                <AuctionsSection />
                <NewListingsSection />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
});
