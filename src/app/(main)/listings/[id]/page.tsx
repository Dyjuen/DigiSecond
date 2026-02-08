"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { TransactionChat } from "@/components/chat/TransactionChat";
import { Countdown } from "@/components/ui/countdown";
import { toast } from "sonner";
import { Heart, Loader2, Lock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Game Logos
import mobileLegendsLogo from "@/assets/images/Mobile-legends-logo.svg.png";
import genshinLogo from "@/assets/images/Genshin_Impact_logo.svg.png";
import valorantLogo from "@/assets/images/Valorant_logo_-_pink_color_version.svg.png";
import pubgLogo from "@/assets/images/PUBG_Corporation_Logo.svg.png";

import { api } from "@/trpc/react";



// Logo map for games
const gameLogoMap: Record<string, any> = {
    "Mobile Legends": mobileLegendsLogo,
    "Genshin Impact": genshinLogo,
    "Valorant": valorantLogo,
    "PUBG Mobile": pubgLogo,
};

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatAction, setChatAction] = useState<"buy_now" | null>(null);
    const [bidAmount, setBidAmount] = useState("");
    const [isBidding, setIsBidding] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const searchParams = useSearchParams();
    const urlAccessCode = searchParams.get("accessCode");

    // Initial state from URL if present
    const [accessCode, setAccessCode] = useState(urlAccessCode || "");
    const [inputAccessCode, setInputAccessCode] = useState(urlAccessCode || "");

    const listingId = params.id as string;

    const { data: listing, isLoading, refetch } = api.listing.getById.useQuery({
        id: listingId,
        accessCode: accessCode
    });

    // Photos handling - MOVED HERE (Top Level)
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Update selected image if listing changes or photos load
    useEffect(() => {
        if (listing) {
            // Sanitize URLs to remove double slashes (except protocol)
            const sanitizedPhotos = listing.photo_urls?.map(url => url.replace(/([^:]\/)\/+/g, "$1")) || [];
            const hasPhotos = sanitizedPhotos.length > 0;
            const gameLogo = gameLogoMap[listing.game] || null;

            if (hasPhotos && !selectedImage) {
                setSelectedImage(sanitizedPhotos[0]);
            } else if (!hasPhotos && !selectedImage) {
                setSelectedImage(gameLogo);
            }
        }
    }, [listing, selectedImage]);

    // Auto-fade carousel
    useEffect(() => {
        if (!listing?.photo_urls?.length || isHovering) return;

        const sanitizedPhotos = listing.photo_urls.map(url => url.replace(/([^:]\/)\/+/g, "$1"));
        if (sanitizedPhotos.length <= 1) return;

        const interval = setInterval(() => {
            setSelectedImage(current => {
                const currentIndex = sanitizedPhotos.indexOf(current || "");
                const nextIndex = (currentIndex + 1) % sanitizedPhotos.length;
                return sanitizedPhotos[nextIndex];
            });
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [listing, isHovering]);

    // Effect to update if URL param changes (optional but good for robustness)
    useEffect(() => {
        if (urlAccessCode) {
            setAccessCode(urlAccessCode);
            setInputAccessCode(urlAccessCode);
            refetch();
        }
    }, [urlAccessCode, refetch]);

    // Wishlist Logic
    const utils = api.useUtils();
    const { data: wishlistData } = api.wishlist.check.useQuery(
        { listingId },
        { enabled: !!session?.user }
    );
    const toggleWishlist = api.wishlist.toggle.useMutation({
        onSuccess: (data) => {
            utils.wishlist.check.invalidate({ listingId });
            toast.success(data.added ? "Ditambahkan ke Wishlist" : "Dihapus dari Wishlist");
        },
        onError: () => {
            toast.error("Gagal mengupdate wishlist");
        }
    });

    const finishAuction = api.listing.finishAuction.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
            refetch();
            setIsFinishing(false);
            if (data.status === "PENDING_PAYMENT") {
                router.push("/transactions"); // Or wherever appropriate
            }
        },
        onError: (err) => {
            toast.error(err.message);
            setIsFinishing(false);
        }
    });

    const placeBidMutation = api.listing.placeBid.useMutation({
        onSuccess: () => {
            setIsBidding(false);
            setBidAmount("");
            toast.success("Penawaran Berhasil!", {
                description: `Anda telah menawar sebesar Rp ${Number(bidAmount).toLocaleString("id-ID")}`,
            });
            refetch();
        },
        onError: (err) => {
            setIsBidding(false);
            toast.error(err.message);
        }
    });



    const handleWishlist = () => {
        if (!session?.user) {
            router.push("/login"); // Or open login modal
            return;
        }
        toggleWishlist.mutate({ listingId });
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setAccessCode(inputAccessCode);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500">Memuat listing...</p>
                </div>
            </div>
        );
    }

    // Handle Locked State
    if ((listing as any).isLocked) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Private Listing</h1>
                    <p className="text-zinc-500 mb-8">
                        Listing ini bersifat pribadi. Masukkan kode akses dari penjual untuk melihat detailnya.
                    </p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Masukkan Kode Akses"
                            value={inputAccessCode}
                            onChange={(e) => setInputAccessCode(e.target.value)}
                            className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all uppercase"
                            maxLength={6}
                        />
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl"
                            disabled={!inputAccessCode}
                        >
                            Buka Listing
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <Link href="/listings" className="text-sm text-zinc-500 hover:text-brand-primary font-medium">
                            Kembali ke Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Listing Tidak Ditemukan</h1>
                    <p className="text-zinc-500 mb-6">Listing yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
                    <Link href="/listings" className="px-6 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-dark transition-colors">
                        Kembali ke Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const handleFinishAuction = () => {
        setShowFinishModal(true);
    };

    const confirmFinishAuction = () => {
        setShowFinishModal(false);
        setIsFinishing(true);
        finishAuction.mutate({ listingId });
    };

    const handleChat = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setShowChatModal(true);
    };

    const handleBuy = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setChatAction("buy_now");
        setShowChatModal(true);
    };



    const handlePlaceBid = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setIsBidding(true);
        placeBidMutation.mutate({
            listingId: listing.listing_id,
            amount: Number(bidAmount)
        });
    };

    const isAuction = listing.listing_type === "AUCTION";
    const gameLogo = gameLogoMap[listing.game];
    const isOwner = session?.user?.id === listing.seller.user_id;

    const hasPhotos = listing.photo_urls && listing.photo_urls.length > 0;

    // Reservation Logic
    const isReserved = (listing as any).reserved_for_user_id && (!(listing as any).reserved_until || new Date((listing as any).reserved_until) > new Date());
    const isReservedByMe = isReserved && (listing as any).reserved_for_user_id === session?.user?.id;
    const isReservedByOther = isReserved && (listing as any).reserved_for_user_id !== session?.user?.id;

    // ... code ...

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                {/* ... Breadcrumb ... */}
                <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                    <Link href="/listings" className="hover:text-brand-primary transition-colors">
                        Marketplace
                    </Link>
                    <span>/</span>
                    <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-brand-primary transition-colors">
                        {listing.game}
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-700 dark:text-zinc-300 line-clamp-1">{listing.title}</span>
                </nav>

                {isReservedByOther && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3">
                        <Lock className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400">Listing ini sedang direservasi</p>
                            <p className="text-sm text-red-600 dark:text-red-500">
                                Sedang dalam proses transaksi oleh pembeli lain. Silakan cek kembali nanti.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                            {/* Auction Badge */}
                            {isAuction && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-600 blur-lg opacity-40"></div>
                                        <div className="relative bg-black/40 backdrop-blur-xl border border-violet-500/30 text-white px-4 py-1.5 rounded-full font-bold shadow-2xl flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                                            LIVE AUCTION
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Image Display */}
                            <div
                                className="h-64 md:h-[400px] bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden group"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                <AnimatePresence mode="wait">
                                    {selectedImage ? (
                                        <motion.div
                                            key={selectedImage}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.7, ease: "easeInOut" }}
                                            className="absolute inset-0 w-full h-full"
                                        >
                                            <Image
                                                src={selectedImage}
                                                alt={listing.title}
                                                fill
                                                className={cn(
                                                    "object-contain",
                                                    (!listing.photo_urls || listing.photo_urls.length === 0) && "p-8"
                                                )}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="w-32 h-32 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-5xl font-bold"
                                        >
                                            {listing.game.charAt(0)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Thumbnails */}
                            {listing.photo_urls && listing.photo_urls.length > 0 && (
                                <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide border-t border-zinc-100 dark:border-zinc-800">
                                    {listing.photo_urls.map((photo: string, index: number) => {
                                        // Sanitize URL
                                        const sanitizedPhoto = photo.replace(/([^:]\/)\/+/g, "$1");
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(sanitizedPhoto)}
                                                className={cn(
                                                    "relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all border-2",
                                                    selectedImage === sanitizedPhoto
                                                        ? "border-brand-primary ring-2 ring-brand-primary/20 scale-95"
                                                        : "border-transparent opacity-70 hover:opacity-100"
                                                )}
                                            >
                                                <Image
                                                    src={sanitizedPhoto}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                {/* Progress/Active Indicator */}
                                                {selectedImage === sanitizedPhoto && !isHovering && listing.photo_urls.length > 1 && (
                                                    <div className="absolute bottom-0 left-0 h-1 bg-brand-primary animate-[progress_3s_linear_infinite]" style={{ width: '100%' }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Fallback to Game Logo thumbnail if no photos (Optional/Legacy behavior) */}
                            {(!listing.photo_urls || listing.photo_urls.length === 0) && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 border-2 border-brand-primary/50">
                                        {gameLogo ? (
                                            <div className="relative w-10 h-10">
                                                <Image
                                                    src={gameLogo}
                                                    alt={listing.game}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-brand-primary font-bold">{listing.game.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auction Status (If Auction) */}
                        {isAuction && listing.auction_ends_at && (
                            <div className="relative overflow-hidden rounded-2xl p-px bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600">
                                <div className="relative bg-zinc-900/90 backdrop-blur-3xl rounded-2xl p-6">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                <span className="text-xl">⏳</span> Sisa Waktu Lelang
                                            </h3>
                                            <p className="text-sm text-zinc-400">Segera berikan penawaran terbaikmu sebelum waktu habis!</p>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-4 min-w-[200px] text-center">
                                            <Countdown targetDate={new Date(listing.auction_ends_at)} className="text-2xl font-mono font-bold text-white tracking-wider" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Deskripsi</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                {listing.description || "Tidak ada deskripsi."}
                            </p>
                        </div>

                        {/* Bid History (If Auction) */}
                        {isAuction && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Riwayat Penawaran</h2>
                                <div className="space-y-4">
                                    {listing.bids && listing.bids.length > 0 ? (
                                        listing.bids.map((bid: any, index: number) => (
                                            <div key={bid.bid_id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-600" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"}`}>
                                                        {index === 0 ? "👑" : `#${index + 1}`}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            {bid.bidderName.substring(0, 2) + "***" + bid.bidderName.substring(bid.bidderName.length - 2)}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            {new Date(bid.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${index === 0 ? "text-brand-primary" : "text-zinc-700 dark:text-zinc-300"}`}>
                                                        Rp {bid.bid_amount.toLocaleString("id-ID")}
                                                    </p>
                                                    {index === 0 && (
                                                        <p className="text-[10px] text-brand-primary font-medium">Tertinggi</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center text-zinc-500">
                                            Belum ada penawaran. Jadilah yang pertama!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
                            <div className="mb-4">
                                <Badge className={`mb-3 ${isAuction ? "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20" : ""}`}>
                                    {isAuction ? "LELANG AKTIF" : listing.game}
                                </Badge>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {listing.title}
                                </h1>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Eye className="w-4 h-4" />
                                        <span>{listing.view_count.toLocaleString()} views</span>
                                    </div>
                                    <button
                                        onClick={handleWishlist}
                                        className={`p-2 rounded-full transition-all ${wishlistData?.isWishlisted ? "bg-red-50 text-red-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500"}`}
                                    >
                                        <Heart className={`w-6 h-6 ${wishlistData?.isWishlisted ? "fill-current" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="py-4 border-y border-zinc-200 dark:border-zinc-800 mb-4">
                                <p className="text-sm text-zinc-500 mb-1">
                                    {isAuction ? "Penawaran Tertinggi Saat Ini" : "Harga"}
                                </p>
                                <p className="text-3xl font-bold text-brand-primary">
                                    Rp {(isAuction ? listing.current_bid : listing.price)?.toLocaleString("id-ID")}
                                </p>
                                {isAuction && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {listing.bidCount} orang telah menawar
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isAuction ? (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                                                Masukkan Penawaran Anda
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                                                <input
                                                    type="text"
                                                    placeholder={`Min. ${((listing.current_bid ?? listing.starting_bid ?? 0) + (listing.bid_increment ?? 10000)).toLocaleString("id-ID")}`}
                                                    value={bidAmount ? Number(bidAmount).toLocaleString("id-ID") : ""}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/\D/g, "");
                                                        const numericValue = Number(rawValue);

                                                        if (numericValue > 2000000000) {
                                                            toast.error("Maksimal penawaran adalah Rp 2.000.000.000");
                                                            // Optional: cap the value or just don't update
                                                            // For better UX, we just don't update the state beyond the limit
                                                            return;
                                                        }

                                                        setBidAmount(rawValue);
                                                    }}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 border-0"
                                            onClick={handlePlaceBid}
                                            disabled={isBidding || !bidAmount}
                                        >
                                            {isBidding ? "Mengirim..." : "Kirim Penawaran"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full h-12 text-base"
                                        onClick={handleBuy}
                                        disabled={isOwner || isReservedByOther}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        {isOwner ? "Listing Anda Sendiri" : isReservedByOther ? "Sedang Direservasi" : "Beli Sekarang"}
                                    </Button>
                                )}

                                {isOwner && isAuction && listing.status === "ACTIVE" && (
                                    <Button
                                        variant="destructive"
                                        className="w-full h-12 text-base font-bold"
                                        onClick={handleFinishAuction}
                                        disabled={isFinishing}
                                    >
                                        {isFinishing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            listing.bidCount > 0 ? "Selesaikan Lelang (Pilih Pemenang)" : "Batalkan Lelang"
                                        )}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-base border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleChat}
                                    disabled={isOwner}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {isOwner ? "Listing Anda" : "Chat Seller"}
                                </Button>
                            </div>

                            {/* Seller & Protection Info */}
                            {(listing as any).is_private && isOwner && (
                                <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                            Private Access Code
                                        </p>
                                        <span className="text-[10px] bg-indigo-200 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                                            HANYA ANDA
                                        </span>
                                    </div>
                                    <div
                                        className="bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group"
                                        onClick={() => {
                                            if ((listing as any).access_code) {
                                                navigator.clipboard.writeText((listing as any).access_code);
                                                toast.success("Kode akses disalin!");
                                            }
                                        }}
                                    >
                                        <p className="text-2xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                                            {(listing as any).access_code}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-1">
                                            Klik untuk menyalin
                                        </p>
                                    </div>
                                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-2 leading-relaxed">
                                        Listing ini tidak muncul di pencarian. <br />Bagikan link ini + kode akses ke pembeli.
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Transaksi dilindungi oleh sistem Escrow. Dana Anda aman sampai barang diterima.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat */}
                <TransactionChat
                    isOpen={showChatModal}
                    onClose={() => {
                        setShowChatModal(false);
                        setChatAction(null);
                    }}
                    listing={{
                        id: listing.listing_id,
                        title: listing.title,
                        price: listing.price,
                        image: gameLogo ? listing.game : listing.game.charAt(0),
                    }}
                    seller={{
                        id: listing.seller.user_id,
                        name: listing.seller.name,
                        avatar: listing.seller.avatar_url || "",
                    }}
                    action={chatAction}
                    onActionHandled={() => setChatAction(null)}
                />

                {/* Finish Auction Confirmation Modal */}
                {showFinishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {listing.bidCount > 0 ? "Selesaikan Lelang?" : "Batalkan Lelang?"}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                    {listing.bidCount > 0
                                        ? "Apakah Anda yakin ingin menyelesaikan lelang ini sekarang? Pemenang akan ditentukan dari penawar tertinggi saat ini."
                                        : "Apakah Anda yakin ingin membatalkan lelang ini? Listing akan dinonaktifkan."}
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFinishModal(false)}
                                        className="flex-1 rounded-xl"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={confirmFinishAuction}
                                        className="flex-1 rounded-xl bg-brand-primary hover:bg-brand-primary-dark"
                                        disabled={isFinishing}
                                    >
                                        {isFinishing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : listing.bidCount > 0 ? (
                                            "Selesaikan"
                                        ) : (
                                            "Batalkan Lelang"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
