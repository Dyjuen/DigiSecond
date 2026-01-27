import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SellTestimonials } from "@/components/sections/sell-testimonials";
import { EndlessStepper } from "@/components/ui/endless-stepper";

const steps = [
    { number: 1, title: "Daftar & Verifikasi", description: "Buat akun dan verifikasi identitas kamu untuk mulai berjualan" },
    { number: 2, title: "Buat Listing", description: "Upload foto, tulis deskripsi, dan tentukan harga produk digital kamu" },
    { number: 3, title: "Terima Pembayaran", description: "Pembeli bayar melalui escrow, dana aman sampai transaksi selesai" },
    { number: 4, title: "Kirim & Terima Dana", description: "Kirim item ke pembeli, setelah konfirmasi dana langsung cair" },
];

const benefits = [
    { icon: "🛡️", title: "Escrow Aman", description: "Dana tersimpan aman sampai pembeli konfirmasi barang diterima" },
    { icon: "💰", title: "Fee Rendah 5%", description: "Biaya platform hanya 5% dari setiap transaksi berhasil" },
    { icon: "📊", title: "Dashboard Penjual", description: "Pantau penjualan, statistik, dan rating di satu tempat" },
    { icon: "🚀", title: "Promosi Gratis", description: "Listing kamu akan tampil di homepage dan kategori populer" },
];

export default function SellPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0" style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)"
                }} />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Jual Barang Digital Kamu
                    </h1>
                    <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                        Bergabung dengan ribuan seller dan mulai hasilkan uang dari akun game, item, atau aset digital kamu
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto">
                                Mulai Jualan Sekarang
                            </Button>
                        </Link>
                        <Link href="/help">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Pelajari Lebih Lanjut
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="py-20 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Cara Kerja
                    </h2>
                    <div className="mt-16">
                        <EndlessStepper steps={steps} />
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 bg-zinc-950">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Keuntungan Jadi Seller
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map(benefit => (
                            <div key={benefit.title} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                                <span className="text-4xl block mb-4">{benefit.icon}</span>
                                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-zinc-400">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials & CTA */}
            <SellTestimonials />
        </div>
    );
}
