import React from "react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Kebijakan Privasi</h1>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Informasi yang Kami Kumpulkan</h2>
                    <p className="leading-relaxed mb-4">
                        Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, melakukan transaksi, atau menghubungi dukungan pelanggan.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Informasi Akun: Nama, alamat email, nomor telepon.</li>
                        <li>Informasi Transaksi: Detail pesanan, riwayat pembelian/penjualan.</li>
                        <li>Komunikasi: Pesan chat antara pembeli dan penjual (untuk keperluan moderasi dan keamanan).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Cara Kami Menggunakan Informasi Anda</h2>
                    <p className="leading-relaxed">
                        Kami menggunakan informasi Anda untuk:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                        <li>Memproses transaksi dan mengirimkan notifikasi terkait.</li>
                        <li>Mendeteksi dan mencegah penipuan atau aktivitas ilegal.</li>
                        <li>Mengirimkan informasi teknis, pembaruan keamanan, dan pesan dukungan.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. Berbagi Informasi</h2>
                    <p className="leading-relaxed">
                        Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dalam keadaan terbatas, seperti:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Dengan penyedia layanan pembayaran (untuk memproses pembayaran).</li>
                        <li>Untuk mematuhi hukum atau permintaan hukum yang sah.</li>
                        <li>Dalam hubungan dengan merger, penjualan aset perusahaan, atau pengambilalihan.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Keamanan Data</h2>
                    <p className="leading-relaxed">
                        Kami mengambil langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses, pengungkapan, pengubahan, atau perusakan yang tidak sah.
                        Namun, tidak ada metode transmisi internet yang 100% aman.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Hak Anda</h2>
                    <p className="leading-relaxed">
                        Anda berhak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda yang kami simpan. Anda dapat mengelola pengaturan akun Anda melalui dashboard pengguna.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Hubungi Kami</h2>
                    <p className="leading-relaxed">
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di support@digisecond.id.
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
