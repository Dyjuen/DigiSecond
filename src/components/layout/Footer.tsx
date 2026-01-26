import Link from "next/link";
import Image from "next/image";
import logoImage from "@/assets/icons/logotrans.png";

export function Footer() {
    return (
        <footer className="py-12 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 relative z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="relative w-32 h-10 transition-transform hover:scale-105">
                            <Image
                                src={logoImage}
                                alt="DigiSecond Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        © 2026 DigiSecond. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="text-zinc-500 hover:text-brand-primary text-sm transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-zinc-500 hover:text-brand-primary text-sm transition-colors">
                            Privacy
                        </Link>
                        <Link href="/help" className="text-zinc-500 hover:text-brand-primary text-sm transition-colors">
                            Help
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
