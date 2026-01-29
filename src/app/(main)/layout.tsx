import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalChatWidget } from "@/components/chat/GlobalChatWidget";
import { FloatingSellButton } from "@/components/layout/FloatingSellButton";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
            <FloatingSellButton />
            <GlobalChatWidget />
        </>
    );
}
