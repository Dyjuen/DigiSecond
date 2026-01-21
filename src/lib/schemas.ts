import { z } from "zod";

// ===========================================
// Listing Schemas
// ===========================================

export const createListingSchema = z.object({
    title: z
        .string()
        .min(5, "Judul minimal 5 karakter")
        .max(100, "Judul maksimal 100 karakter"),
    description: z
        .string()
        .min(20, "Deskripsi minimal 20 karakter")
        .max(5000, "Deskripsi maksimal 5000 karakter"),
    price: z
        .number()
        .int("Harga harus bilangan bulat")
        .min(1000, "Harga minimal Rp 1.000")
        .max(999999999, "Harga maksimal Rp 999.999.999"),
    categoryId: z.string().uuid("Kategori tidak valid"),
    photos: z
        .array(z.string().url())
        .min(1, "Minimal 1 foto")
        .max(5, "Maksimal 5 foto"),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
    query: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    minPrice: z.number().int().min(0).optional(),
    maxPrice: z.number().int().optional(),
    sortBy: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
    limit: z.number().int().min(1).max(50).optional().default(24),
    cursor: z.string().uuid().optional(),
});

// ===========================================
// Auth Schemas
// ===========================================

export const registerSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar")
        .regex(/[0-9]/, "Password harus mengandung angka"),
    name: z
        .string()
        .min(2, "Nama minimal 2 karakter")
        .max(50, "Nama maksimal 50 karakter"),
});

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(1, "Password tidak boleh kosong"),
});

export const verifyEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, "Kode verifikasi harus 6 digit"),
});

// ===========================================
// Transaction Schemas
// ===========================================

export const createTransactionSchema = z.object({
    listingId: z.string().uuid("Listing tidak valid"),
});

export const markTransferredSchema = z.object({
    transactionId: z.string().uuid(),
    transferProof: z.string().url("Bukti transfer tidak valid"),
});

export const confirmReceivedSchema = z.object({
    transactionId: z.string().uuid(),
});

// ===========================================
// Dispute Schemas
// ===========================================

export const createDisputeSchema = z.object({
    transactionId: z.string().uuid(),
    category: z.enum(["NOT_AS_DESCRIBED", "ACCESS_ISSUE", "FRAUD", "OTHER"]),
    description: z
        .string()
        .min(20, "Deskripsi minimal 20 karakter")
        .max(2000, "Deskripsi maksimal 2000 karakter"),
});

export const addEvidenceSchema = z.object({
    disputeId: z.string().uuid(),
    url: z.string().url("URL tidak valid"),
    type: z.enum(["image", "video", "document"]),
});

export const resolveDisputeSchema = z.object({
    disputeId: z.string().uuid(),
    resolution: z.enum(["FULL_REFUND", "PARTIAL_REFUND", "NO_REFUND"]),
    notes: z.string().optional(),
});

// ===========================================
// Message Schemas
// ===========================================

export const sendMessageSchema = z.object({
    transactionId: z.string().uuid(),
    content: z
        .string()
        .min(1, "Pesan tidak boleh kosong")
        .max(2000, "Pesan maksimal 2000 karakter"),
    attachment: z.string().url().optional(),
});

// ===========================================
// Review Schemas
// ===========================================

export const createReviewSchema = z.object({
    transactionId: z.string().uuid(),
    rating: z.number().int().min(1).max(5, "Rating harus 1-5"),
    comment: z
        .string()
        .min(10, "Ulasan minimal 10 karakter")
        .max(1000, "Ulasan maksimal 1000 karakter")
        .optional(),
});

// ===========================================
// User Schemas
// ===========================================

export const updateUserSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    avatar: z.string().url().optional(),
    phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor HP tidak valid").optional(),
});

// ===========================================
// Type Exports
// ===========================================

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
