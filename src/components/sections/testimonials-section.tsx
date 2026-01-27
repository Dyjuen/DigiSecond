"use client";

import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";
import Link from "next/link";

const testimonials: Testimonial[] = [
    {
        text: "Jual akun MLBB Glory cepet banget laku disini. Sistem escrow bikin buyer percaya, duit langsung cair pas transaksi beres.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        name: "Rian Saputra",
        role: "Seller Mobile Legends",
    },
    {
        text: "Awalnya ragu beli akun Genshin Impact second, takut di hackback. Tapi pake DigiSecond aman banget, adminnya nengahin sampe email keganti.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        name: "Sarah Wijaya",
        role: "Buyer Genshin Impact",
    },
    {
        text: "Support 24 jam beneran nyata. Jam 2 malem ada kendala login langsung dibales dan dipandu sampe bisa. Top markotop!",
        image: "https://randomuser.me/api/portraits/men/86.jpg",
        name: "Budi Santoso",
        role: "Trader Valorant",
    },
    {
        text: "Buat yang mau pensi main game dan jadiin duit, DigiSecond tempat paling oke. Fee transaksinya masuk akal dan transparan.",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        name: "Jessica Tan",
        role: "Seller PUBG Mobile",
    },
    {
        text: "Cari akun Free Fire spek sultan disini banyak pilihannya. Seller-sellernya juga ramah-ramah karena udah diverifikasi KTP.",
        image: "https://randomuser.me/api/portraits/men/12.jpg",
        name: "Dimas Anggara",
        role: "Buyer Free Fire",
    },
    {
        text: "Fitur listing-nya gampang dipake. Upload screenshot, kasih deskripsi, langsung tayang. Dashboard sellernya juga rapi.",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        name: "Putri Larasati",
        role: "Seller Roblox",
    },
    {
        text: "Udah 5x transaksi disini lancar jaya. Gapernah kena tipu karena duit ditahan sistem dulu. Recommended marketplace!",
        image: "https://randomuser.me/api/portraits/men/54.jpg",
        name: "Kevin Pratama",
        role: "Top Buyer",
    },
    {
        text: "Sebagai reseller, DigiSecond ngebantu banget muterin modal. Proses withdrawal ke rekening bank cepet banget.",
        image: "https://randomuser.me/api/portraits/women/90.jpg",
        name: "Nadia Utami",
        role: "Reseller Voucher",
    },
    {
        text: "Tampilan websitenya modern dan enak dilihat. Dark mode-nya bikin betah browsing akun lama-lama.",
        image: "https://randomuser.me/api/portraits/men/41.jpg",
        name: "Reza Mahendra",
        role: "UI/UX Enthusiast",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-zinc-50 dark:bg-black">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container z-10 mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-3xl mx-auto text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm mb-6">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Trusted by Gamers</span>
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                        Apa Kata Mereka Tentang <span className="text-brand-primary">DigiSecond</span>?
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Bergabunglah dengan ribuan trader yang telah merasakan pengalaman jual beli akun game yang aman dan nyaman.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-dark rounded-xl text-white font-bold shadow-lg shadow-brand-primary/25 transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Mulai Jualan Sekarang
                        </Link>
                        <Link
                            href="/listings"
                            className="px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold transition-all duration-300"
                        >
                            Lihat Review Lainnya
                        </Link>
                    </div>
                </motion.div>

                <div className="relative mt-10 max-h-[740px] overflow-hidden">
                    {/* Fade Overlay Top/Bottom */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-zinc-50 dark:from-black to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-black to-transparent z-10 pointer-events-none"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TestimonialsColumn testimonials={firstColumn} duration={25} />
                        <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
                        <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
                    </div>
                </div>
            </div>
        </section>
    );
};
