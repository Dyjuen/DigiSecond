import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Searchbar, useTheme, Text, Button, Badge } from 'react-native-paper';
import { HomeHeader } from '../../components/HomeHeader';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useListingStore, FilterOptions } from '../../stores/listingStore';
import { ListingCard } from '../../components/ListingCard';
import { FilterModal } from '../../components/FilterModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Store State
    const { getFilteredListings } = useListingStore();

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({});
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Initial load from params (if navigated from category)
    useEffect(() => {
        if (params.category) {
            // Ensure array
            setFilters(prev => ({ ...prev, category: [params.category as string] }));
        }
        if (params.query) {
            const q = params.query as string;
            setSearchQuery(q);
            setDebouncedSearchQuery(q);
        }
    }, [params]);

    // Debounce Search Query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    // Derived Listings (depends on DEBOUNCED query)
    const filteredListings = useMemo(() => {
        return getFilteredListings(debouncedSearchQuery, filters);
    }, [debouncedSearchQuery, filters, getFilteredListings]);

    // Derived: Active Filter Count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category && filters.category.length > 0) count += filters.category.length;
        if (filters.minPrice !== undefined) count++;
        if (filters.maxPrice !== undefined) count++;
        if (filters.sortBy && filters.sortBy !== 'newest') count++;
        return count;
    }, [filters]);

    const handleApplyFilters = (newFilters: FilterOptions) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilters({});
    };



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
            {/* Header Area using HomeHeader */}
            <HomeHeader
                isSearchMode={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onBack={() => router.back()}
            />

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <View>
                    <Button
                        mode="outlined"
                        onPress={() => setIsFilterVisible(true)}
                        icon="filter-variant"
                        style={styles.filterButton}
                    >
                        Filter & Sort
                    </Button>
                    {activeFilterCount > 0 && (
                        <Badge size={16} style={styles.badge}>{activeFilterCount}</Badge>
                    )}
                </View>

                {/* Visual Chips for active filters */}
                <FlatList
                    horizontal
                    data={useMemo(() => {
                        const items: { key: string; label: string; type: 'category' | 'sort' | 'price' | 'other'; value?: any }[] = [];
                        const { minPrice, maxPrice, category, sortBy, ...others } = filters;

                        // 1. Categories
                        if (category && category.length > 0) {
                            category.forEach((cat) => {
                                items.push({
                                    key: `cat-${cat}`,
                                    label: cat,
                                    type: 'category',
                                    value: cat
                                });
                            });
                        }

                        // 2. Sort By
                        if (sortBy && sortBy !== 'newest') {
                            const sortLabels: Record<string, string> = {
                                'price_asc': 'Harga: Rendah ke Tinggi',
                                'price_desc': 'Harga: Tinggi ke Rendah'
                            };
                            items.push({
                                key: 'sortBy',
                                label: sortLabels[sortBy] || sortBy,
                                type: 'sort'
                            });
                        }

                        // 3. Price
                        if (minPrice !== undefined && maxPrice !== undefined) {
                            items.push({
                                key: 'priceRange',
                                label: `${minPrice} - ${maxPrice}`,
                                type: 'price'
                            });
                        } else if (minPrice !== undefined) {
                            items.push({
                                key: 'minPrice',
                                label: `> ${minPrice}`,
                                type: 'price'
                            });
                        } else if (maxPrice !== undefined) {
                            items.push({
                                key: 'maxPrice',
                                label: `< ${maxPrice}`,
                                type: 'price'
                            });
                        }

                        return items;
                    }, [filters])}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setFilters(prev => {
                                    const next = { ...prev };

                                    if (item.type === 'category') {
                                        // Remove specific category
                                        next.category = next.category?.filter(c => c !== item.value);
                                        if (next.category?.length === 0) delete next.category;
                                    } else if (item.type === 'sort') {
                                        delete next.sortBy;
                                    } else if (item.type === 'price') {
                                        if (item.key === 'priceRange') {
                                            delete next.minPrice;
                                            delete next.maxPrice;
                                        } else {
                                            delete next[item.key as keyof FilterOptions];
                                        }
                                    }

                                    return next;
                                });
                            }}
                        >
                            <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.secondaryContainer }]}>
                                <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer, marginRight: 4 }}>
                                    {item.label}
                                </Text>
                                <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.onSecondaryContainer} />
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingLeft: 8 }}
                    style={{ flex: 1 }}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Results */}
            <FlatList
                data={filteredListings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ListingCard
                        id={item.id}
                        title={item.title}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        onPress={() => router.push(`/listing/${item.id}`)}
                        style={styles.card}
                    />
                )}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color={theme.colors.outline} />
                        <Text style={{ marginTop: 16, color: theme.colors.onBackground, fontWeight: '500' }}>Tidak ada hasil ditemukan</Text>
                    </View>
                }
            />

            <FilterModal
                visible={isFilterVisible}
                onDismiss={() => setIsFilterVisible(false)}
                currentFilters={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
    },
    searchBar: {
        flex: 1,
        elevation: 0,
        backgroundColor: 'transparent',
        height: 48,
    },
    searchInput: {
        minHeight: 0, // Fix for some searchbar styling issues
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterButton: {
        marginRight: 8,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: 0,
    },
    activeFilterChip: {
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%', // Approx half with spacing
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
});
