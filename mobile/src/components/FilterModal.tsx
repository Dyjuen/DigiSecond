import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Chip, TextInput, RadioButton, Divider, useTheme } from 'react-native-paper';
import { FilterOptions } from '../stores/listingStore';

interface FilterModalProps {
    visible: boolean;
    onDismiss: () => void;
    currentFilters: FilterOptions;
    onApply: (filters: FilterOptions) => void;
    onReset: () => void;
}

const CATEGORIES = ["Mobile Legends", "Genshin Impact", "Valorant", "Roblox", "Free Fire", "Steam"];
const SORT_OPTIONS = [
    { label: "Terbaru", value: "newest" },
    { label: "Harga: Rendah ke Tinggi", value: "price_asc" },
    { label: "Harga: Tinggi ke Rendah", value: "price_desc" },
];

const TYPE_OPTIONS = [
    { label: "Semua", value: "all" },
    { label: "Listing", value: "FIXED" },
    { label: "Lelang", value: "AUCTION" },
];

export function FilterModal({ visible, onDismiss, currentFilters, onApply, onReset }: FilterModalProps) {
    const theme = useTheme();

    // Local state for the modal form
    const [categories, setCategories] = useState<string[]>(currentFilters.category || []);
    const [minPrice, setMinPrice] = useState<string>(currentFilters.minPrice ? String(currentFilters.minPrice) : '');
    const [maxPrice, setMaxPrice] = useState<string>(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '');
    const [sortBy, setSortBy] = useState<string>(currentFilters.sortBy || 'newest');
    const [type, setType] = useState<string>(currentFilters.type || 'all');

    const handleApply = () => {
        onApply({
            category: categories.length > 0 ? categories : undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sortBy: sortBy as any,
            type: type === 'all' ? undefined : (type as 'FIXED' | 'AUCTION')
        });
        onDismiss();
    };

    const handleReset = () => {
        setCategories([]);
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
        setType('all');
        onReset();
        // onDismiss(); // Optional: keep open or close on reset? Let's keep it open or let user close
    };

    // Update local state when modal opens with new props
    React.useEffect(() => {
        if (visible) {
            setCategories(currentFilters.category || []);
            setMinPrice(currentFilters.minPrice ? String(currentFilters.minPrice) : '');
            setMaxPrice(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '');
            setSortBy(currentFilters.sortBy || 'newest');
            setType(currentFilters.type || 'all');
        }
    }, [visible, currentFilters]);

    const toggleCategory = (cat: string) => {
        if (categories.includes(cat)) {
            setCategories(categories.filter(c => c !== cat));
        } else {
            setCategories([...categories, cat]);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Filter & Sort</Text>
                    <Button onPress={handleReset}>Reset</Button>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Type Filter - Listed First */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>Tipe Listing</Text>
                    <View style={styles.chipContainer}>
                        {TYPE_OPTIONS.map((opt) => (
                            <Chip
                                key={opt.value}
                                selected={type === opt.value}
                                onPress={() => setType(opt.value)}
                                style={styles.chip}
                                showSelectedOverlay
                            >
                                {opt.label}
                            </Chip>
                        ))}
                    </View>

                    <Divider style={styles.divider} />

                    {/* Categories */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>Kategori</Text>
                    <View style={styles.chipContainer}>
                        {CATEGORIES.map((cat) => (
                            <Chip
                                key={cat}
                                selected={categories.includes(cat)}
                                onPress={() => toggleCategory(cat)}
                                style={styles.chip}
                                showSelectedOverlay
                            >
                                {cat}
                            </Chip>
                        ))}
                    </View>

                    <Divider style={styles.divider} />

                    {/* Price Range */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>Harga (IDR)</Text>
                    <View style={styles.priceContainer}>
                        <TextInput
                            label="Min"
                            value={minPrice}
                            onChangeText={setMinPrice}
                            // @ts-ignore - RNP typings issue
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.priceInput}
                            dense
                        />
                        <Text style={{ marginHorizontal: 8 }}>-</Text>
                        <TextInput
                            label="Max"
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            // @ts-ignore - RNP typings issue
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.priceInput}
                            dense
                        />
                    </View>

                    <Divider style={styles.divider} />

                    {/* Sort */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>Urutkan</Text>
                    <RadioButton.Group onValueChange={value => setSortBy(value)} value={sortBy}>
                        {SORT_OPTIONS.map((opt) => (
                            <RadioButton.Item key={opt.value} label={opt.label} value={opt.value} />
                        ))}
                    </RadioButton.Group>

                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
                    <Button mode="contained" onPress={handleApply} style={styles.applyButton}>
                        Terapkan Filter
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
        paddingVertical: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 12,
        fontWeight: '600',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceInput: {
        flex: 1,
    },
    divider: {
        marginVertical: 16,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    applyButton: {
        paddingVertical: 6,
    }
});
