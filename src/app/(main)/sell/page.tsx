"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

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
    username: z.string().optional(),
    password: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

export default function SellPage() {
    const router = useRouter();
    const { status } = useSession();
    const [files, setFiles] = useState<File[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);

    // Added Manual Login Check
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/sell");
        }
    }, [status, router]);

    const createListing = api.listing.create.useMutation({
        onSuccess: (data) => {
            toast.success("Listing berhasil dibuat!");
            router.push(`/listings/${data.listing_id}`);
        },
        onError: (error) => {
            toast.error(error.message);
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
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: ListingFormValues, isDraft: boolean) => {
        if (files.length === 0) {
            toast.warning("File belum diupload (Sistem upload sedang maintenance), listing tetap dibuat.");
        }

        try {
            await createListing.mutateAsync({
                title: data.title,
                description: data.description,
                price: data.price,
                category_id: data.category_id,
                listing_type: data.listing_type,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "files" | "photos") => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (type === "files") setFiles(newFiles);
            else setPhotos(newFiles);
        }
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
                            <input
                                type="number"
                                {...form.register("price")}
                                placeholder="10000"
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, "photos")}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Maks. 2MB per foto</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={form.handleSubmit((data) => onSubmit(data, true))}
                            disabled={createListing.isPending}
                            className="flex-1"
                        >
                            {(createListing.isPending) ? "Memproses..." : "Simpan sebagai Draft"}
                        </Button>
                        <Button
                            type="button"
                            onClick={form.handleSubmit((data) => onSubmit(data, false))}
                            disabled={createListing.isPending}
                            className="flex-1"
                        >
                            {(createListing.isPending) ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Menerbitkan...
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
