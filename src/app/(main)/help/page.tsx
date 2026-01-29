import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import ScrollFAQAccordion from "@/components/ui/scroll-faqaccordion";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/effects/Aurora";
import { MessageCircle, Mail, Phone } from "lucide-react";

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
    { icon: <MessageCircle className="w-6 h-6" />, name: "Live Chat", description: "Chat langsung dengan tim support", available: "24/7" },
    { icon: <Mail className="w-6 h-6" />, name: "Email", description: "support@digisecond.id", available: "Respon 1x24 jam" },
    { icon: <Phone className="w-6 h-6" />, name: "WhatsApp", description: "+62 812-XXXX-XXXX", available: "09:00 - 21:00 WIB" },
];

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-300">
            {/* Aurora Background - Matching Landing Page */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <Aurora
                    colorStops={["#6366f1", "#a5b4fc", "#6366f1"]}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.5}
                />
            </div>

            <div className="relative z-10">
                <Navbar />

                <div className="pt-24 pb-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                                Pusat Bantuan
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                Temukan jawaban cepat atau hubungi tim support kami untuk bantuan lebih lanjut.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* LEFT COLUMN: Contact Form */}
                            <div>
                                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group transition-colors duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/20 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Hubungi Kami</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                                            Isi formulir di bawah ini dan kami akan segera membalas pesan Anda.
                                        </p>

                                        <form className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                                        placeholder="email@anda.com"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Subjek</label>
                                                <select className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer appearance-none">
                                                    <option>Pilih Kategori Bantuan</option>
                                                    <option>Kendala Transaksi</option>
                                                    <option>Verifikasi Akun</option>
                                                    <option>Laporan Penipuan</option>
                                                    <option>Lainnya</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Pesan</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                                    placeholder="Jelaskan kendala yang Anda alami secara detail..."
                                                />
                                            </div>

                                            <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transform hover:-translate-y-0.5 transition-all duration-300">
                                                Krim Pesan
                                            </Button>
                                        </form>

                                        {/* Contact Channels Grid */}
                                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-3">
                                            {contactChannels.map((channel) => (
                                                <div key={channel.name} className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-default group/item">
                                                    <div className="mb-2 p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 group-hover/item:text-brand-primary group-hover/item:bg-brand-primary/10 transition-colors">
                                                        {channel.icon}
                                                    </div>
                                                    <div className="text-xs font-bold text-zinc-800 dark:text-white mb-0.5">{channel.name}</div>
                                                    <div className="text-[10px] text-zinc-500">{channel.available}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FAQ Accordion */}
                            <div>
                                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/30 rounded-3xl overflow-hidden shadow-lg dark:shadow-none transition-colors duration-300">
                                    <div className="pt-8 px-6 pb-2">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                            Pertanyaan yang sering diajukan oleh pengguna kami.
                                        </p>
                                    </div>
                                    <ScrollFAQAccordion
                                        data={faqs.map((f, i) => ({ id: i + 1, ...f }))}
                                        className="pb-8 px-6 pt-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
