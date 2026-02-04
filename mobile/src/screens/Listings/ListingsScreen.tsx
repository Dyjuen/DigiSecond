import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { CategoriesSection } from "../../components/CategoriesSection";
import { AuctionsSection } from "../../components/AuctionsSection";
import { NewListingsSection } from "../../components/NewListingsSection";
import { CustomRefreshControl } from "../../components/CustomRefreshControl";
import { api } from "../../lib/api";



export default function ListingsScreen() {
    const theme = useTheme();
    const utils = api.useUtils();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        // Invalidate all listing queries to refetch data
        await utils.listing.invalidate();
        setRefreshing(false);
    }, [utils]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <CustomRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
