"use client";

import React from "react";
import { motion } from "motion/react";
import { Aurora } from "@/components/effects/Aurora";
import { useTheme } from "next-themes";
import {
    Database,
    Eye,
    Share2,
    Lock,
    UserCheck,
    Mail,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

const sections = [
    {
        id: "koleksi",
        title: "1. Informasi yang Kami Kumpulkan",
        icon: Database,
        content: (
            <div className="space-y-4">
                <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, melakukan transaksi, atau menghubungi dukungan pelanggan.</p>
                <ul className="space-y-3">
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span><strong className="text-zinc-900 dark:text-white">Informasi Akun:</strong> Nama, alamat email, nomor telepon.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span><strong className="text-zinc-900 dark:text-white">Informasi Transaksi:</strong> Detail pesanan, riwayat pembelian/penjualan.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span><strong className="text-zinc-900 dark:text-white">Komunikasi:</strong> Pesan chat antara pembeli dan penjual (untuk keperluan moderasi dan keamanan).</span>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: "penggunaan",
        title: "2. Cara Kami Menggunakan Informasi",
        icon: Eye,
        content: (
            <div className="space-y-4">
                <p>Kami menggunakan informasi Anda untuk:</p>
                <ul className="space-y-3">
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Menyediakan, memelihara, dan meningkatkan layanan kami.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Memproses transaksi dan mengirimkan notifikasi terkait.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Mendeteksi dan mencegah penipuan atau aktivitas ilegal.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Mengirimkan informasi teknis, pembaruan keamanan, dan pesan dukungan.</span>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: "berbagi",
        title: "3. Berbagi Informasi",
        icon: Share2,
        content: (
            <div className="space-y-4">
                <p>Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dalam keadaan terbatas, seperti:</p>
                <ul className="space-y-3">
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Dengan penyedia layanan pembayaran (untuk memproses pembayaran).</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Untuk mematuhi hukum atau permintaan hukum yang sah.</span>
                    </li>
                    <li className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>Dalam hubungan dengan merger, penjualan aset perusahaan, atau pengambilalihan.</span>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: "keamanan",
        title: "4. Keamanan Data",
        icon: Lock,
        content: "Kami mengambil langkah-langamanan yang wajar untuk melindungi informasi Anda dari akses, pengungkapan, pengubahan, atau perusakan yang tidak sah. Namun, tidak ada metode transmisi internet yang 100% aman."
    },
    {
        id: "hak",
        title: "5. Hak Anda",
        icon: UserCheck,
        content: "Anda berhak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda yang kami simpan. Anda dapat mengelola pengaturan akun Anda melalui dashboard pengguna."
    },
    {
        id: "kontak",
        title: "6. Hubungi Kami",
        icon: Mail,
        content: "Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di support@digisecond.id."
    }
];

export default function PrivacyPage() {
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
                        Kebijakan Privasi
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-16 text-center max-w-2xl mx-auto">
                        Bagaimana kami menjaga dan mengelola data pribadi Anda untuk keamanan bersama.
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
