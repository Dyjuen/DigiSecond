import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "~/styles/globals.css";
import { Footer } from "@/components/layout/Footer";
import { CursorProvider, Cursor, CursorFollow } from "@/components/ui/custom-cursor";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner"; // Added Toaster
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: {
        default: "DigiSecond - Marketplace Barang Digital",
        template: "%s | DigiSecond",
    },
    description:
        "Jual beli akun game, item, dan aset digital dengan aman. Escrow terpercaya, pembayaran mudah.",
    keywords: [
        "jual akun game",
        "beli akun game",
        "marketplace digital",
        "mobile legends",
        "free fire",
        "genshin impact",
        "jual skin",
        "beli diamond",
    ],
    openGraph: {
        type: "website",
        locale: "id_ID",
        url: "https://digisecond.id",
        siteName: "DigiSecond",
        title: "DigiSecond - Marketplace Barang Digital",
        description:
            "Jual beli akun game, item, dan aset digital dengan aman. Escrow terpercaya, pembayaran mudah.",
    },
    twitter: {
        card: "summary_large_image",
        title: "DigiSecond - Marketplace Barang Digital",
        description:
            "Jual beli akun game, item, dan aset digital dengan aman.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className={inter.variable} suppressHydrationWarning>
            <body className="min-h-screen bg-white antialiased dark:bg-gray-900 overflow-x-hidden">
                <AuthProvider>
                    <TRPCReactProvider>
                        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
                            <CursorProvider>
                                <Cursor />
                                <CursorFollow>Buyer</CursorFollow>
                                <Toaster position="top-right" richColors closeButton />
                                {children}
                            </CursorProvider>
                        </ThemeProvider>
                    </TRPCReactProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
