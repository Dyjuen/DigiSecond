import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import ScrollFAQAccordion from "@/components/ui/scroll-faqaccordion";

const faqs = [
    {
        question: "Apa itu DigiSecond?",
        answer: "DigiSecond adalah marketplace terpercaya untuk jual beli barang digital seperti akun game, item, skin, dan aset digital lainnya dengan sistem escrow yang menjamin keamanan transaksi."
    },
    {
        question: "Bagaimana sistem escrow bekerja?",
        answer: "Ketika pembeli melakukan pembayaran, dana akan disimpan di escrow kami. Setelah pembeli konfirmasi menerima barang, dana baru akan diteruskan ke seller. Ini melindungi kedua belah pihak dari penipuan."
    },
    {
        question: "Berapa biaya platform?",
        answer: "Kami mengenakan biaya 5% dari setiap transaksi berhasil. Biaya ini sudah termasuk sistem escrow, payment gateway, dan customer support 24/7."
    },
    {
        question: "Bagaimana cara menjadi seller?",
        answer: "Daftar akun, verifikasi identitas kamu, lalu mulai buat listing. Proses verifikasi biasanya selesai dalam 1x24 jam."
    },
    {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer: "Kami mendukung Bank Transfer, E-Wallet (OVO, GoPay, Dana), QRIS, dan Virtual Account dari berbagai bank."
    },
    {
        question: "Bagaimana jika ada masalah dengan transaksi?",
        answer: "Tim dispute resolution kami siap membantu. Hubungi support dan kami akan investigasi serta menyelesaikan masalah dengan adil."
    },
];

const contactChannels = [
    { icon: "💬", name: "Live Chat", description: "Chat langsung dengan tim support", available: "24/7" },
    { icon: "📧", name: "Email", description: "support@digisecond.id", available: "Respon 1x24 jam" },
    { icon: "📱", name: "WhatsApp", description: "+62 812-XXXX-XXXX", available: "09:00 - 21:00 WIB" },
];

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="pt-16">
                {/* Hero */}
                <div className="py-16 border-b border-zinc-800">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Pusat Bantuan
                        </h1>
                        <p className="text-lg text-zinc-400 mb-8">
                            Ada pertanyaan? Kami siap membantu kamu
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Cari bantuan..."
                                className="w-full h-12 pl-12 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Channels */}
                <div className="py-16">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">
                            Hubungi Kami
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {contactChannels.map(channel => (
                                <div key={channel.name} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center hover:border-brand-primary transition-colors">
                                    <span className="text-4xl block mb-4">{channel.icon}</span>
                                    <h3 className="font-semibold text-white mb-1">{channel.name}</h3>
                                    <p className="text-zinc-400 text-sm mb-2">{channel.description}</p>
                                    <p className="text-xs text-brand-primary">{channel.available}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Scroll Accordion */}
                <div className="bg-zinc-950">
                    <ScrollFAQAccordion data={faqs.map((f, i) => ({ id: i + 1, ...f }))} />
                </div>
            </div>
        </div>
    );
}
