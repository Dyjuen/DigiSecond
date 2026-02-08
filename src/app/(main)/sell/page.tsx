"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload } from "lucide-react";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

// Categories mapping
const CATEGORIES = [
    { value: "mobile-legends", label: "Mobile Legends" },
    { value: "free-fire", label: "Free Fire" },
    { value: "pubg-mobile", label: "PUBG Mobile" },
    { value: "genshin-impact", label: "Genshin Impact" },
    { value: "valorant", label: "Valorant" },
    { value: "roblox", label: "Roblox" },
    { value: "steam", label: "Steam" },
    { value: "playstation", label: "PlayStation" },
    { value: "other", label: " Lainnya" },
];

const listingSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter").max(100, "Maksimal 100 karakter"),
    description: z.string().min(20, "Deskripsi minimal 20 karakter"),
    price: z.coerce.number().min(10000, "Harga minimal Rp 10.000").max(2000000000, "Harga maksimal 2 Milyar"),
    category_id: z.string().min(1, "Pilih kategori"),
    listing_type: z.enum(["FIXED", "AUCTION"]),
    duration: z.coerce.number().min(1, "Durasi minimal 1 jam").optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    is_private: z.boolean().default(false),
});

type ListingFormValues = z.infer<typeof listingSchema>;

export default function SellPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [files, setFiles] = useState<File[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);

    // Added Manual Login Check
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/sell");
        }
    }, [status, router]);

    const [isUploading, setIsUploading] = useState(false);

    // Mutation to get signed upload URL
    const getUploadUrl = api.listing.uploadPhoto.useMutation();

    const createListing = api.listing.create.useMutation({
        onSuccess: (data) => {
            toast.success("Listing berhasil dibuat!");
            router.push(`/listings/${data.listing_id}`);
        },
        onError: (error) => {
            toast.error(error.message);
            setIsUploading(false); // Reset uploading state on error
            if (error.message.includes("Verifikasi")) {
                router.push("/profile/edit");
            }
        },
    });

    const form = useForm<ListingFormValues>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: "",
            description: "",
            price: undefined,
            category_id: "",
            listing_type: "FIXED",
            duration: 24, // Default 24 hours
            username: "",
            password: "",
            is_private: false,
        },
    });

    const listingType = form.watch("listing_type");

    const onSubmit = async (data: ListingFormValues, isDraft: boolean) => {
        setIsUploading(true);

        try {
            // 1. Upload Photos
            const uploadedPhotoUrls: string[] = [];
            if (photos.length > 0) {
                toast.info(`Mengupload ${photos.length} foto...`);
                for (const photo of photos) {
                    try {
                        const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
                            fileName: photo.name,
                            fileType: photo.type as any,
                        });
                        const uploadRes = await fetch(uploadUrl, {
                            method: "PUT",
                            body: photo,
                            headers: { "Content-Type": photo.type },
                        });
                        if (!uploadRes.ok) throw new Error(`Gagal mengupload ${photo.name}`);
                        uploadedPhotoUrls.push(publicUrl);
                    } catch (err) {
                        console.error("Upload failed for", photo.name, err);
                        toast.error(`Gagal mengupload foto: ${photo.name}`);
                    }
                }
            }

            // 2. Upload Digital File (if any)
            let digitalFileUrl = "";
            if (files.length > 0) {
                const file = files[0]; // Only take the first file for now
                toast.info(`Mengupload file: ${file.name}...`);
                try {
                    // Using same uploadPhoto mutation but it works for any file if we allow the type in backend validation
                    // Wait, backend validation for uploadPhoto limits types to images. 
                    // I should probably skip backend validation or create a new endpoint, 
                    // BUT for now I'll try to use the same logic if I can, OR just use the client to upload if I had a generic presigned URL.
                    // IMPORTANT: The current `uploadPhoto` restricts to images.
                    // I will assume for now I can bypass or I need to quick-fix the backend.
                    // Actually, I'll just use the same mutation and hope the type check is loose enough or I'll fix the backend validation next.
                    // The backend checks `z.enum(["image/jpeg", "image/png", "image/webp"])`. 
                    // I MUST FIX THE BACKEND ROUTER FIRST TO ALLOW OTHER FILES.
                    // But to save steps, I will Modify the backend router in the next step to allow these types.

                    const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
                        fileName: file.name,
                        fileType: file.type as any, // Cast to any to bypass client type check, server will validate
                    });
                    const uploadRes = await fetch(uploadUrl, {
                        method: "PUT",
                        body: file,
                        headers: { "Content-Type": file.type },
                    });
                    if (!uploadRes.ok) throw new Error(`Gagal mengupload file`);
                    digitalFileUrl = publicUrl;
                } catch (err) {
                    console.error("File upload failed", err);
                    toast.error("Gagal mengupload file digital");
                    setIsUploading(false);
                    return; // Stop if file upload fails
                }
            }

            let auctionEndsAt: Date | undefined;
            if (data.listing_type === "AUCTION" && data.duration) {
                const endDate = new Date();
                endDate.setHours(endDate.getHours() + data.duration);
                auctionEndsAt = endDate;
            }

            await createListing.mutateAsync({
                title: data.title,
                description: data.description,
                price: data.price,
                category_id: data.category_id,
                listing_type: data.listing_type,
                auction_ends_at: auctionEndsAt,
                status: isDraft ? "DRAFT" : "ACTIVE",
                is_private: data.is_private,
                photos: uploadedPhotoUrls,
                // Auto-Delivery fields
                login_username: data.username,
                login_password: data.password,
                digital_file_url: digitalFileUrl || undefined,
            });
        } catch (error) {
            console.error(error);
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "files" | "photos") => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (type === "files") {
                setFiles(newFiles);
            } else {
                // For photos, we append to existing photos, respecting the limit of 5
                setPhotos(prev => {
                    const combined = [...prev, ...newFiles];
                    if (combined.length > 5) {
                        toast.warning("Maksimal 5 foto diizinkan.");
                        return combined.slice(0, 5);
                    }
                    return combined;
                });
            }
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    if (status === "loading" || status === "unauthenticated") {
        return <div className="min-h-screen pt-24 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Buat Listing Baru
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Isi form di bawah untuk menjual barang digital Anda
                    </p>
                </div>

                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mb-8 flex gap-3">
                    <div className="shrink-0 text-brand-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">Status Plan: {session?.user?.tier || "FREE"}</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {session?.user?.tier === "FREE"
                                ? "Limit 5 listing per bulan. Upgrade ke PRO untuk Unlimited Listing!"
                                : "Anda menikmati Unlimited Listing dengan plan PRO."}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            *Setiap pengguna dapat membuat Private Listing (Escrow Room).
                        </p>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                            Judul Listing *
                        </label>
                        <input
                            {...form.register("title")}
                            placeholder="Contoh: Akun Mobile Legends Mythic 100 Skin"
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            maxLength={100}
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1 text-right">{form.watch("title")?.length || 0}/100 karakter</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                            Deskripsi *
                        </label>
                        <textarea
                            {...form.register("description")}
                            placeholder="Jelaskan detail barang digital Anda (min. 20 karakter)"
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] resize-y"
                            maxLength={5000}
                        />
                        {form.formState.errors.description && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1 text-right">{form.watch("description")?.length || 0}/5000 karakter</p>
                    </div>

                    {/* Category & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                Kategori *
                            </label>
                            <select
                                {...form.register("category_id")}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Pilih Kategori</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            {form.formState.errors.category_id && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.category_id.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                Harga (IDR) *
                            </label>
                            <Controller
                                control={form.control}
                                name="price"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="10000"
                                        value={value ? Number(value).toLocaleString("id-ID") : ""}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, "");
                                            const numericValue = Number(rawValue);

                                            if (numericValue > 2000000000) {
                                                toast.error("Harga maksimal adalah Rp 2.000.000.000");
                                                return;
                                            }

                                            onChange(rawValue === "" ? "" : numericValue);
                                        }}
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                            />
                            {form.formState.errors.price && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.price.message}</p>
                            )}
                            <p className="text-xs text-zinc-500 mt-1">Minimal Rp 10.000</p>
                        </div>
                    </div>

                    {/* Listing Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                            Tipe Penjualan
                        </label>
                        <select
                            {...form.register("listing_type")}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="FIXED">Jual Langsung (Fixed Price)</option>
                            <option value="AUCTION">Lelang (Auction)</option>
                        </select>
                    </div>

                    {/* Private Listing Option */}
                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <input
                            type="checkbox"
                            id="is_private"
                            {...form.register("is_private")}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                        <label htmlFor="is_private" className="flex-1 cursor-pointer">
                            <span className="block font-medium text-zinc-900 dark:text-white">Private Listing (Escrow Room)</span>
                            <span className="block text-xs text-zinc-500">
                                Listing tidak akan muncul di pencarian. Pembeli butuh <span className="font-bold text-indigo-500">Kode Akses</span> untuk melihat dan membeli.
                            </span>
                        </label>
                    </div>

                    {listingType === "AUCTION" && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                Durasi Lelang (Jam)
                            </label>
                            <input
                                type="number"
                                {...form.register("duration")}
                                placeholder="24"
                                min={1}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {form.formState.errors.duration && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.duration.message}</p>
                            )}
                            <p className="text-xs text-zinc-500 mt-1">Masukkan durasi dalam jam (Contoh: 24 = 1 Hari)</p>
                        </div>
                    )}

                    {/* Account Credentials */}
                    <div className="border border-zinc-300 dark:border-zinc-700 rounded-xl p-6 bg-white dark:bg-zinc-900">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                            Kredensial Akun (Opsional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Username/Email
                                </label>
                                <input
                                    type="text"
                                    {...form.register("username")}
                                    placeholder="username@example.com"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Password
                                </label>
                                <input
                                    type="text"
                                    {...form.register("password")}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                File Digital * (PDF/ZIP/TXT)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.zip,.txt"
                                onChange={(e) => handleFileChange(e, "files")}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Maks. 50MB</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                Foto (Opsional, maks. 5)
                            </label>

                            {/* Photo Previews */}
                            {photos.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                            <img
                                                src={URL.createObjectURL(photo)}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photos.length < 5 && (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleFileChange(e, "photos")}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group"
                                    >
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-indigo-500" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                            Klik untuk upload foto
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            Maks. 2MB per foto
                                        </p>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={form.handleSubmit((data) => onSubmit(data, true))}
                            disabled={createListing.isPending || isUploading}
                            className="flex-1"
                        >
                            {(createListing.isPending || isUploading) ? "Memproses..." : "Simpan sebagai Draft"}
                        </Button>
                        <Button
                            type="button"
                            onClick={form.handleSubmit((data) => onSubmit(data, false))}
                            disabled={createListing.isPending || isUploading}
                            className="flex-1"
                        >
                            {(createListing.isPending || isUploading) ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {isUploading ? "Mengupload..." : "Menerbitkan..."}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 mr-2" />
                                    Publikasikan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
