import React from "react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Syarat dan Ketentuan</h1>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Pendahuluan</h2>
                    <p className="leading-relaxed">
                        Selamat datang di DigiSecond. Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan syarat dan ketentuan ini.
                        Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Definisi</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>&quot;Platform&quot;</strong> merujuk pada situs web dan layanan DigiSecond.</li>
                        <li><strong>&quot;Pengguna&quot;</strong> merujuk pada pembeli, penjual, atau pengunjung platform.</li>
                        <li><strong>&quot;Produk Digital&quot;</strong> merujuk pada akun game, item dalam game, voucher, atau aset digital lainnya yang diperdagangkan.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. Akun Pengguna</h2>
                    <p className="leading-relaxed">
                        Untuk menggunakan fitur tertentu, Anda harus mendaftar dan membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda
                        dan untuk semua aktivitas yang terjadi di bawah akun Anda.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Transaksi dan Pembayaran</h2>
                    <p className="leading-relaxed">
                        DigiSecond menyediakan layanan Escrow (Rekening Bersama) untuk mengamankan transaksi.
                        Pembayaran diteruskan ke penjual hanya setelah pembeli mengonfirmasi penerimaan dan validitas produk digital.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Larangan</h2>
                    <p className="leading-relaxed">
                        Pengguna dilarang menjual produk ilegal, hasil peretasan (hack), atau produk yang melanggar ketentuan layanan game/platform terkait.
                        DigiSecond berhak membekukan akun yang melanggar aturan ini.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Penafian Jaminan</h2>
                    <p className="leading-relaxed">
                        Layanan disediakan &quot;sebagaimana adanya&quot;. DigiSecond tidak menjamin bahwa layanan akan selalu bebas dari gangguan atau kesalahan.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">7. Perubahan Syarat</h2>
                    <p className="leading-relaxed">
                        Kami dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu. Perubahan akan berlaku efektif segera setelah diposting di halaman ini.
                    </p>
                </section>

                <section className="pt-8 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500">
                        Terakhir diperbarui: 27 Januari 2026
                    </p>
                </section>
            </div>
        </div>
    );
}
