"use client";

import React from "react";
import { motion } from "motion/react";
import { Aurora } from "@/components/effects/Aurora";
import { useTheme } from "next-themes";
import {
    Info,
    BookOpen,
    UserCircle,
    CreditCard,
    ShieldAlert,
    Scale,
    RefreshCcw,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

const sections = [
    {
        id: "pendahuluan",
        title: "1. Pendahuluan",
        icon: Info,
        content: "Selamat datang di DigiSecond. Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami."
    },
    {
        id: "definisi",
        title: "2. Definisi",
        icon: BookOpen,
        content: (
            <ul className="space-y-3">
                <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="text-brand-primary font-bold">•</span>
                    <span><strong className="text-zinc-900 dark:text-white">&quot;Platform&quot;</strong> merujuk pada situs web dan layanan DigiSecond.</span>
                </li>
                <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="text-brand-primary font-bold">•</span>
                    <span><strong className="text-zinc-900 dark:text-white">&quot;Pengguna&quot;</strong> merujuk pada pembeli, penjual, atau pengunjung platform.</span>
                </li>
                <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="text-brand-primary font-bold">•</span>
                    <span><strong className="text-zinc-900 dark:text-white">&quot;Produk Digital&quot;</strong> merujuk pada akun game, item dalam game, voucher, atau aset digital lainnya yang diperdagangkan.</span>
                </li>
            </ul>
        )
    },
    {
        id: "akun",
        title: "3. Akun Pengguna",
        icon: UserCircle,
        content: "Untuk menggunakan fitur tertentu, Anda harus mendaftar dan membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda dan untuk semua aktivitas yang terjadi di bawah akun Anda."
    },
    {
        id: "transaksi",
        title: "4. Transaksi dan Pembayaran",
        icon: CreditCard,
        content: "DigiSecond menyediakan layanan Escrow (Rekening Bersama) untuk mengamankan transaksi. Pembayaran diteruskan ke penjual hanya setelah pembeli mengonfirmasi penerimaan dan validitas produk digital."
    },
    {
        id: "larangan",
        title: "5. Larangan",
        icon: ShieldAlert,
        content: "Pengguna dilarang menjual produk ilegal, hasil peretasan (hack), atau produk yang melanggar ketentuan layanan game/platform terkait. DigiSecond berhak membekukan akun yang melanggar aturan ini."
    },
    {
        id: "jaminan",
        title: "6. Penafian Jaminan",
        icon: Scale,
        content: "Layanan disediakan \"sebagaimana adanya\". DigiSecond tidak menjamin bahwa layanan akan selalu bebas dari gangguan atau kesalahan."
    },
    {
        id: "perubahan",
        title: "7. Perubahan Syarat",
        icon: RefreshCcw,
        content: "Kami dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu. Perubahan akan berlaku efektif segera setelah diposting di halaman ini."
    }
];

export default function TermsPage() {
    const { resolvedTheme } = useTheme();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <Aurora
                    colorStops={resolvedTheme === "light" ? ["#6366f1", "#a5b4fc", "#c7d2fe"] : ["#6366f1", "#a5b4fc", "#6366f1"]}
                    blend={0.5}
                    amplitude={0.8}
                    speed={0.4}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-primary transition-colors mb-12">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4 text-center">
                        Syarat dan Ketentuan
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-16 text-center max-w-2xl mx-auto">
                        Aturan main menggunakan platform DigiSecond untuk transaksi yang aman dan nyaman.
                    </p>

                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <motion.section
                                key={section.id}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-brand-primary/30 transition-all group"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                                            {section.title}
                                        </h2>
                                        <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            {section.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
                        <p>© 2026 DigiSecond Platform. All rights reserved.</p>
                        <p>Terakhir diperbarui: 27 Januari 2026</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
