import { create } from 'zustand';

export interface Listing {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    description: string;
    category?: string;
    photos?: string[];
    sellerId: string;
}

export interface FilterOptions {
    category?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    type?: 'FIXED' | 'AUCTION';
}

export const CURRENT_USER_ID = "user_me";

interface ListingState {
    listings: Listing[];
    addListing: (listing: Listing) => void;
    updateListing: (id: string, listing: Partial<Listing>) => void;
    deleteListing: (id: string) => void;
    getListingById: (id: string) => Listing | undefined;
    getFilteredListings: (query: string, filters: FilterOptions) => Listing[];
}

const MOCK_LISTINGS: Listing[] = [
    {
        id: "1",
        title: "Mobile Legends Mythic Account - Max Embols",
        price: 1500000,
        imageUrl: "https://picsum.photos/400/300?random=1",
        description: "High winrate, many skins. Safe transaction guaranteed.",
        category: "Mobile Legends",
        photos: ["https://picsum.photos/400/300?random=1"],
        sellerId: CURRENT_USER_ID,
    },
    {
        id: "2",
        title: "Genshin Impact AR 60 - All Archons",
        price: 3500000,
        imageUrl: "https://picsum.photos/400/300?random=2",
        description: "Day 1 account, well maintained. All archons C0.",
        category: "Genshin Impact",
        photos: ["https://picsum.photos/400/300?random=2"],
        sellerId: "other_seller_1",
    },
    {
        id: "3",
        title: "Valorant Radiant Account - Vandal Skin",
        price: 850000,
        imageUrl: "https://picsum.photos/400/300?random=3",
        description: "Radiant buddy, reaver vandal. Email modifiable.",
        category: "Valorant",
        photos: ["https://picsum.photos/400/300?random=3"],
        sellerId: "other_seller_2",
    },
    {
        id: "4",
        title: "Steam Types - 100+ Games",
        price: 2000000,
        imageUrl: "https://picsum.photos/400/300?random=4",
        description: "CS2 Prime, GTA V, RDR2. No bans.",
        category: "Steam",
        photos: ["https://picsum.photos/400/300?random=4"],
        sellerId: CURRENT_USER_ID,
    },
    {
        id: "5",
        title: "Roblox Account 2010 - Rare Hat",
        price: 500000,
        imageUrl: "https://picsum.photos/400/300?random=5",
        description: "Vintage account with verifying email.",
        category: "Roblox",
        photos: ["https://picsum.photos/400/300?random=5"],
        sellerId: "other_seller_3",
    },
];

export const useListingStore = create<ListingState>((set, get) => ({
    listings: MOCK_LISTINGS,
    addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
    updateListing: (id, updatedListing) => set((state) => ({
        listings: state.listings.map((l) => (l.id === id ? { ...l, ...updatedListing } : l)),
    })),
    deleteListing: (id) => set((state) => ({
        listings: state.listings.filter((l) => l.id !== id),
    })),
    getListingById: (id) => get().listings.find((l) => l.id === id),
    getFilteredListings: (query, filters) => {
        let result = get().listings;

        // 1. Text Search
        if (query) {
            const lowerQuery = query.toLowerCase();
            result = result.filter(l =>
                l.title.toLowerCase().includes(lowerQuery) ||
                l.description.toLowerCase().includes(lowerQuery)
            );
        }

        // 1.5 Type Filter (Mock) - verify if mock listings have type property or if we need to add it
        // The mock data currently doesn't have `listing_type` or `type`, so this is just for interface completeness
        // In real app, API handles this.


        // 2. Category Filter
        if (filters.category && filters.category.length > 0) {
            result = result.filter(l => l.category && filters.category?.includes(l.category));
        }

        // 3. Price Filter
        if (filters.minPrice !== undefined) {
            result = result.filter(l => l.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            result = result.filter(l => l.price <= filters.maxPrice!);
        }

        // 4. Sort
        if (filters.sortBy) {
            result = [...result]; // Clone to avoid mutating generic list
            switch (filters.sortBy) {
                case 'price_asc':
                    result.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    result.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    // Mock data doesn't have reliable dates, assume ID order is time order for now
                    result.sort((a, b) => Number(b.id) - Number(a.id));
                    break;
            }
        }

        return result;
    }
}));
