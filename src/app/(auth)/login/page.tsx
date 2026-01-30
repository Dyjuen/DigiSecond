"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import LightRays from '@/components/effects/light-rays';
import { GoogleIcon } from '@/components/ui/social-icons';
import { signIn, getSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-zinc-700 bg-black/40 backdrop-blur-sm transition-colors focus-within:border-indigo-500 focus-within:bg-indigo-500/10">
        {children}
    </div>
);

export default function LoginPage() {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Mengalihkan ke Google...");

        try {
            const result = await signIn("google", {
                redirect: false,
                callbackUrl: "/"
            });

            if (result?.error) {
                toast.dismiss(loadingToast);
                toast.error(`Gagal masuk dengan Google: ${result.error}`);
                setLoading(false);
            } else if (result?.url) {
                toast.dismiss(loadingToast);
                toast.success("Mengarahkan ke Google...");
                router.push(result.url);
            }

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan sistem saat inisialisasi Google Login");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const loadingToast = toast.loading(isAdminMode ? "Memverifikasi kredensial..." : "Mengirim email login...");

        try {
            if (isAdminMode) {
                // Admin Credentials Login
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl: "/admin", // Redirect to Admin Dashboard
                });

                if (result?.error) {
                    toast.dismiss(loadingToast);
                    toast.error("Email atau password salah.");
                    setError("Autentikasi gagal.");
                    setLoading(false);
                } else if (result?.ok) {
                    toast.dismiss(loadingToast);
                    toast.success("Login Berhasil! Mengalihkan...", { duration: 2000 });
                    router.push("/admin");
                }
            } else {
                // Magic Link Login
                const result = await signIn("email", {
                    email,
                    redirect: false,
                    callbackUrl: "/",
                });

                if (result?.error) {
                    toast.dismiss(loadingToast);
                    toast.error("Gagal mengirim email login. Silakan coba lagi.");
                    setError("Gagal mengirim email login.");
                } else {
                    toast.dismiss(loadingToast);
                    toast.success("Email login telah dikirim! Silakan periksa inbox anda.", {
                        duration: 5000,
                        description: "Klik link di email untuk masuk ke akun anda."
                    });
                }
                setLoading(false);
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan saat login");
            setError("Terjadi kesalahan saat login");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-geist w-full overflow-hidden bg-black text-white">

            {/* Left column: Form Area (approx 30-35%) */}
            <section className="w-full lg:w-[35%] flex items-center justify-center p-8 lg:p-12 z-20 relative bg-[#09090b] lg:rounded-r-[3rem] shadow-[10px_0_30px_-5px_rgba(0,0,0,0.5)] border-r border-zinc-800">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div>
                            <h1 className="text-5xl font-bold leading-tight tracking-tight">
                                Selamat <span className="text-indigo-500">Datang</span>
                            </h1>
                            <p className="text-zinc-400 font-medium mt-2">
                                {isAdminMode ? "Login khusus Administrator." : "Akses dashboard DigiSecond dan mulai trading."}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="text-sm font-bold text-zinc-300 mb-2 block">Alamat Email</label>
                                <GlassInputWrapper>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={isAdminMode ? "admin@digisecond.com" : "Masukkan email anda"}
                                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-600 text-white font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </GlassInputWrapper>
                            </div>

                            {isAdminMode && (
                                <div>
                                    <label className="text-sm font-bold text-zinc-300 mb-2 block">Password</label>
                                    <GlassInputWrapper>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-600 text-white font-medium pr-12"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </GlassInputWrapper>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-2xl py-4 font-bold text-white transition-colors shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed ${isAdminMode
                                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                                    }`}
                            >
                                {loading ? "Memproses..." : isAdminMode ? "Masuk sebagai Admin" : "Masuk"}
                            </button>
                        </form>

                        {!isAdminMode && (
                            <>
                                <div className="relative flex items-center justify-center my-4">
                                    <span className="w-full border-t border-zinc-800"></span>
                                    <span className="px-4 text-xs font-bold text-zinc-600 bg-[#09090b] absolute uppercase tracking-widest">Atau masuk dengan</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-zinc-800 rounded-2xl py-3 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                                        <GoogleIcon />
                                        <span className="text-zinc-300 font-bold">Google</span>
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col items-center gap-2 mt-4 text-sm font-medium">
                            {!isAdminMode ? (
                                <>
                                    <p className="text-zinc-500">
                                        Baru di DigiSecond? <Link href="/register" className="text-indigo-500 hover:text-indigo-400 hover:underline transition-colors font-bold">Daftar Sekarang</Link>
                                    </p>
                                    <button
                                        onClick={() => setIsAdminMode(true)}
                                        className="text-zinc-600 hover:text-zinc-400 text-xs mt-4"
                                    >
                                        [ Login Administrator ]
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsAdminMode(false)}
                                    className="text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-full"
                                >
                                    ← Kembali ke Login User
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Right column: Light Rays (Rest of width) */}
            <section className="hidden lg:block flex-1 relative bg-black overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12 text-center pointer-events-none">
                    <h2 className="text-6xl font-extrabold text-white mb-8 tracking-tight">
                        Masa Depan <br />
                        <span className="text-indigo-500">Trading Digital</span>
                    </h2>
                    <p className="text-zinc-400 text-xl max-w-lg leading-relaxed font-medium">
                        Aman, cepat, dan terpercaya bagi ribuan gamer di seluruh Indonesia.
                    </p>
                </div>

                <LightRays
                    raysOrigin="top-center"
                    raysColor={isAdminMode ? "#dc2626" : "#6366f1"} // Red for admin, Indigo for user
                    raysSpeed={0.5}
                    lightSpread={0.2}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.2}
                    noiseAmount={0}
                    distortion={0}
                    pulsating={true}
                    fadeDistance={1}
                    saturation={1}
                    className="opacity-60"
                />
            </section>
        </div>
    );
};
