import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Gamepad2, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Image from "next/image"; // Import Image component

// Simple useDebounce hook
function useDebounce<T>(value: T, delay: number): [T] {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return [debouncedValue];
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [debouncedQuery] = useDebounce(query, 500);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Auto focus input when opened
    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
        }
    }, [isOpen]);

    // Handle ESC key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Fetch search results
    const { data: searchResults, isLoading } = api.listing.getAll.useQuery(
        { search: debouncedQuery, limit: 5 },
        { enabled: debouncedQuery.length > 2 }
    );

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        onClose();
        router.push(`/listings?search=${encodeURIComponent(term)}`);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch(query);
        }
    };

    const popularGames = ["Mobile Legends", "Free Fire", "Genshin Impact", "Valorant", "PUBG Mobile"];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Search Container */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 top-0 z-[51] p-4 md:p-8"
                    >
                        <div className="max-w-2xl mx-auto w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            {/* Search Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <Search className="w-5 h-5 text-zinc-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Cari akun game, item, atau joki..."
                                    className="flex-1 bg-transparent text-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                                />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-primary" />
                                        <p>Mencari listing...</p>
                                    </div>
                                )}

                                {/* Results */}
                                {!isLoading && debouncedQuery.length > 2 && searchResults?.listings && (
                                    <div className="space-y-1">
                                        <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Hasil Pencarian
                                        </p>

                                        {searchResults.listings.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                                    <AlertCircle className="w-6 h-6 text-zinc-400" />
                                                </div>
                                                <p className="font-medium text-zinc-900 dark:text-white">Tidak ditemukan</p>
                                                <p className="text-sm text-zinc-500 mt-1">
                                                    Kami tidak menemukan listing untuk &quot;{query}&quot;.
                                                    <br />Coba kata kunci lain atau cek saran di bawah.
                                                </p>
                                            </div>
                                        ) : (
                                            searchResults.listings.map((listing) => (
                                                <button
                                                    key={listing.listing_id}
                                                    onClick={() => {
                                                        onClose();
                                                        router.push(`/listings/${listing.listing_id}`);
                                                    }}
                                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left group"
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden relative">
                                                        {/* Fallback image if no specific image is available, simplistic logic from listings page */}
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400 bg-zinc-200 dark:bg-zinc-700">
                                                            {listing.category.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-zinc-900 dark:text-white truncate group-hover:text-brand-primary transition-colors">
                                                            {listing.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                                            <span>{listing.category.name}</span>
                                                            <span>•</span>
                                                            <span className="text-brand-primary font-semibold">
                                                                Rp {listing.price.toLocaleString("id-ID")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Default View (No Query) or Typo Suggestions */}
                                {(!debouncedQuery || (debouncedQuery.length > 2 && searchResults?.listings.length === 0)) && (
                                    <div className="p-2">
                                        {searchResults?.listings.length === 0 ? (
                                            <p className="px-2 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Mungkin maksud Anda:
                                            </p>
                                        ) : (
                                            <p className="px-2 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Game Populer
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 mt-2 px-2">
                                            {popularGames.map((game) => (
                                                <button
                                                    key={game}
                                                    onClick={() => handleSearch(game)}
                                                    className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Gamepad2 className="w-4 h-4 text-brand-primary" />
                                                    {game}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Action */}
                                {debouncedQuery.length > 0 && (
                                    <div className="p-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <button
                                            onClick={() => handleSearch(query)}
                                            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                                        >
                                            <Search className="w-4 h-4" />
                                            Lihat semua hasil untuk &quot;{query}&quot;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
