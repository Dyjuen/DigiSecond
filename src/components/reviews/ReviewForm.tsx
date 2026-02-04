"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface ReviewFormProps {
    transactionId: string;
    sellerName: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export function ReviewForm({ transactionId, sellerName, onSuccess, onClose }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const createReview = api.review.create.useMutation({
        onSuccess: () => {
            toast.success("Review berhasil dikirim!");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = () => {
        if (comment.length > 0 && comment.length < 10) {
            toast.error("Komentar minimal 10 karakter");
            return;
        }

        createReview.mutate({
            transaction_id: transactionId,
            rating,
            comment: comment.length >= 10 ? comment : undefined,
        });
    };

    const displayRating = hoveredRating ?? rating;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Review untuk {sellerName}
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(null)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <svg
                                className={`w-8 h-8 ${star <= displayRating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-zinc-300 dark:text-zinc-600"
                                    }`}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                />
                            </svg>
                        </button>
                    ))}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {displayRating === 5 && "Luar biasa! ⭐"}
                    {displayRating === 4 && "Sangat bagus!"}
                    {displayRating === 3 && "Cukup baik"}
                    {displayRating === 2 && "Kurang memuaskan"}
                    {displayRating === 1 && "Sangat buruk"}
                </p>
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Komentar (Opsional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bagikan pengalaman Anda dengan penjual ini..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                    rows={3}
                    maxLength={1000}
                />
                <p className="text-xs text-zinc-400 mt-1 text-right">
                    {comment.length}/1000
                </p>
            </div>

            {/* Submit */}
            <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createReview.isPending}
            >
                {createReview.isPending ? "Mengirim..." : "Kirim Review"}
            </Button>
        </div>
    );
}
