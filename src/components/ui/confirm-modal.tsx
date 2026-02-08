"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "success" | "warning";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
}: ConfirmModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const getIcon = () => {
        switch (variant) {
            case "destructive":
                return <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
            case "success":
                return <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
            default:
                return <Info className="w-6 h-6 text-brand-primary" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case "destructive": return "destructive";
            case "success": return "default"; // Add success variant if available or use default styling
            default: return "default";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-full shrink-0",
                                        variant === "destructive" && "bg-red-50 dark:bg-red-900/20",
                                        variant === "warning" && "bg-amber-50 dark:bg-amber-900/20",
                                        variant === "success" && "bg-emerald-50 dark:bg-emerald-900/20",
                                        variant === "default" && "bg-brand-primary/10"
                                    )}>
                                        {getIcon()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="rounded-xl"
                                    >
                                        {cancelText}
                                    </Button>
                                    <Button
                                        variant={getConfirmButtonVariant()}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn("rounded-xl min-w-[100px]", variant === "success" && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                                    >
                                        {isLoading ? "Processing..." : confirmText}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
