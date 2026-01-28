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

export const CURRENT_USER_ID = "user_me";

interface ListingState {
    listings: Listing[];
    addListing: (listing: Listing) => void;
    updateListing: (id: string, listing: Partial<Listing>) => void;
    deleteListing: (id: string) => void;
    getListingById: (id: string) => Listing | undefined;
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
}));
