import Link from "next/link";

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container-app text-center">
                {/* Logo/Brand */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                        Digi<span className="text-brand-primary">Second</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                        Marketplace Barang Digital Terpercaya
                    </p>
                </div>

                {/* Hero description */}
                <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
                    Jual dan beli akun game, item, skin, dan aset digital dengan aman.
                    Dilengkapi sistem escrow dan perlindungan pembeli.
                </p>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/listings"
                        className="btn-primary btn-lg inline-flex items-center gap-2"
                    >
                        <span>🔍</span>
                        Jelajahi Listing
                    </Link>
                    <Link
                        href="/register"
                        className="btn-secondary btn-lg inline-flex items-center gap-2"
                    >
                        <span>🚀</span>
                        Mulai Jualan
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-20 grid gap-8 sm:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 text-4xl">🔒</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Escrow Aman
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Dana aman tersimpan sampai barang diterima
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 text-4xl">💳</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pembayaran Mudah
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            VA, E-Wallet, QRIS - semua tersedia
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 text-4xl">⚡</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Cepat & Responsif
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Transaksi selesai dalam hitungan menit
                        </p>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-16 text-sm text-gray-400">
                    Coming soon • MVP in development
                </p>
            </div>
        </main>
    );
}
