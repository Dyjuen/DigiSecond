import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Placeholder data - will be replaced with real data from tRPC
const featuredListings = [
    { id: "1", title: "Akun ML Sultan", game: "Mobile Legends", price: 2500000, image: "🎮" },
    { id: "2", title: "Genshin AR 58", game: "Genshin Impact", price: 1800000, image: "⚔️" },
    { id: "3", title: "Valorant Radiant", game: "Valorant", price: 3200000, image: "💥" },
    { id: "4", title: "PUBG Conqueror", game: "PUBG Mobile", price: 1500000, image: "🎯" },
    { id: "5", title: "FF Max Account", game: "Free Fire", price: 900000, image: "🔥" },
    { id: "6", title: "Roblox Premium", game: "Roblox", price: 500000, image: "🧱" },
];

const categories = [
    { name: "Mobile Legends", count: 1234, icon: "🎮" },
    { name: "Free Fire", count: 892, icon: "🔥" },
    { name: "PUBG Mobile", count: 756, icon: "🎯" },
    { name: "Genshin Impact", count: 543, icon: "⚔️" },
    { name: "Valorant", count: 421, icon: "💥" },
    { name: "Roblox", count: 389, icon: "🧱" },
];

export default function ListingsPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Marketplace
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Temukan akun game, item, dan aset digital dengan harga terbaik
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Cari akun, item, atau game..."
                                className="w-full h-12 pl-12 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>
                    </div>
                    <select className="h-12 px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-brand-primary">
                        <option>Semua Kategori</option>
                        {categories.map(cat => (
                            <option key={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <select className="h-12 px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-brand-primary">
                        <option>Urutkan: Terbaru</option>
                        <option>Harga: Terendah</option>
                        <option>Harga: Tertinggi</option>
                    </select>
                </div>

                {/* Categories */}
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-4">Kategori Populer</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map(cat => (
                            <Link
                                key={cat.name}
                                href={`/listings?category=${encodeURIComponent(cat.name)}`}
                                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-primary transition-all group"
                            >
                                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <p className="font-medium text-white text-sm">{cat.name}</p>
                                <p className="text-xs text-zinc-500">{cat.count.toLocaleString()} listing</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Listings Grid */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Listing Terbaru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredListings.map(listing => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-brand-primary transition-all group"
                            >
                                {/* Image placeholder */}
                                <div className="h-48 bg-zinc-800 flex items-center justify-center text-6xl">
                                    {listing.image}
                                </div>
                                <div className="p-4">
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                        {listing.game}
                                    </Badge>
                                    <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                                        {listing.title}
                                    </h3>
                                    <p className="text-lg font-bold text-brand-primary mt-2">
                                        Rp {listing.price.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
