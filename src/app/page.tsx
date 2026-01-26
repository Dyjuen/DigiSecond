import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white dark:bg-zinc-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-subtle via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800" />

                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-6 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary-subtle dark:bg-brand-primary/20 text-brand-primary-dark dark:text-brand-primary mb-6">
                                <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Marketplace #1 Indonesia</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                                Trading Digital Goods
                                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                                    Aman & Terpercaya
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0">
                                Jual beli akun game, item, skin, dan aset digital dengan sistem escrow.
                                Dana aman sampai barang diterima.
                            </p>

                            {/* CTAs */}
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link
                                    href="/listings"
                                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-primary rounded-xl text-white font-semibold shadow-3d hover:shadow-3d-hover transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Jelajahi Marketplace
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold border-2 border-zinc-200 dark:border-zinc-700 hover:border-brand-primary dark:hover:border-brand-primary hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Mulai Jualan
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Escrow Aman</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>24/7 Support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Verified Sellers</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - 3D Hero placeholder */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative w-80 h-80 lg:w-[450px] lg:h-[450px]">
                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-hero rounded-full blur-3xl opacity-30 animate-pulse-slow" />

                                {/* 3D Element container - floating animation */}
                                <div className="relative w-full h-full flex items-center justify-center animate-float">
                                    {/* Placeholder for 3D webp - replace with actual 3D asset */}
                                    <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-3d flex items-center justify-center">
                                        <span className="text-8xl">🎮</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-32 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="container mx-auto px-6">
                    {/* Section header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">
                            Kenapa <span className="text-brand-primary">DigiSecond</span>?
                        </h2>
                        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Platform terpercaya untuk jual beli barang digital dengan perlindungan maksimal
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-brand-primary-subtle dark:bg-brand-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Escrow Aman
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Dana aman tersimpan di escrow sampai pembeli konfirmasi barang diterima. Tidak ada resiko penipuan.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Pembayaran Lengkap
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Bank Transfer, E-Wallet (OVO, GoPay, Dana), QRIS, dan Virtual Account. Semua metode tersedia.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Seller Terverifikasi
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Semua seller melewati proses verifikasi. Rating dan review transparan untuk keamanan transaksi.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Transaksi Cepat
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Proses jual beli selesai dalam hitungan menit. Real-time chat untuk koordinasi dengan seller.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Dispute Resolution
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Tim support siap membantu jika ada masalah. Garansi refund jika barang tidak sesuai deskripsi.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-800 shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                                Mobile Friendly
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Trading kapan saja, di mana saja. Aplikasi mobile tersedia untuk iOS dan Android.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">
                            Game Populer
                        </h2>
                        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                            Temukan akun dan item dari game favoritmu
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: "Mobile Legends", icon: "🎮" },
                            { name: "Free Fire", icon: "🔥" },
                            { name: "PUBG Mobile", icon: "🎯" },
                            { name: "Genshin Impact", icon: "⚔️" },
                            { name: "Valorant", icon: "💥" },
                            { name: "Roblox", icon: "🧱" },
                        ].map((game, i) => (
                            <Link
                                key={i}
                                href={`/listings?category=${game.name.toLowerCase().replace(" ", "-")}`}
                                className="group p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 hover:border-brand-primary dark:hover:border-brand-primary text-center transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                            >
                                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{game.icon}</span>
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{game.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-brand-primary to-brand-secondary">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Siap Mulai Trading?
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
                        Bergabung dengan ribuan gamer Indonesia yang sudah trading dengan aman di DigiSecond
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-white rounded-xl text-brand-primary font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Daftar Gratis Sekarang
                        </Link>
                        <Link
                            href="/listings"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                        >
                            Lihat Marketplace
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-zinc-900 dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">
                                Digi<span className="text-brand-primary">Second</span>
                            </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            © 2026 DigiSecond. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/terms" className="text-zinc-400 hover:text-white text-sm transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="text-zinc-400 hover:text-white text-sm transition-colors">
                                Privacy
                            </Link>
                            <Link href="/help" className="text-zinc-400 hover:text-white text-sm transition-colors">
                                Help
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
