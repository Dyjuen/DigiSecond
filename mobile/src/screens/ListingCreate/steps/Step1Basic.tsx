import { ActionSheetIOS, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, List, Modal, Portal, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import { useState } from "react";
import { api } from "../../../lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Step1Props {
    data: {
        name: string;
        category: string;
        category_id?: string;
        listing_type?: "FIXED" | "AUCTION";
    };
    onChange: (key: string, value: string) => void;
}

export default function Step1Basic({ data, onChange }: Step1Props) {
    const theme = useTheme();

    const [visible, setVisible] = useState(false);
    const { data: categories, isLoading } = api.category.getAll.useQuery();

    const handleSelect = (category: { id: string, name: string }) => {
        onChange("category_id", category.id);
        onChange("category", category.name); // Keep for display
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="headlineSmall" style={{ marginBottom: 16, color: theme.colors.onSurface }}>Pilih Kategori</Text>
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.category_id}
                            renderItem={({ item }: { item: { category_id: string; name: string } }) => (
                                <List.Item
                                    title={item.name}
                                    titleStyle={{ color: theme.colors.onSurface }}
                                    onPress={() => handleSelect({ id: item.category_id, name: item.name })}
                                    right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurface} />}
                                />
                            )}
                        />
                    )}
                </Modal>
            </Portal>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Tipe Listing</Text>
                <SegmentedButtons
                    value={data.listing_type || "FIXED"}
                    onValueChange={(value: string) => onChange("listing_type", value)}
                    buttons={[
                        {
                            value: 'FIXED',
                            label: 'Jual Langsung',
                            icon: 'cart-outline',
                        },
                        {
                            value: 'AUCTION',
                            label: 'Lelang',
                            icon: 'gavel',
                        },
                    ]}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Nama Produk</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Nama Produk"
                    value={data.name}
                    onChangeText={(text: string) => onChange("name", text)}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    outlineStyle={styles.inputOutline}
                />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Minimal 5 karakter
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Kategori Produk</Text>
                <TouchableOpacity onPress={() => setVisible(true)}>
                    <View style={[styles.selector, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ color: data.category ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                            {data.category || "Pilih Kategori Produk"}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#71717a',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f4f4f5',
    },
    inputOutline: {
        borderRadius: 8,
        borderWidth: 0,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f4f4f5',
    },
    modalContent: {
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    }
});
