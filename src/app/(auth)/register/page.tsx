"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import LightRays from '@/components/effects/light-rays';

// --- HELPER COMPONENTS (ICONS) ---

// GoogleIcon is now imported from '@/components/ui/social-icons'

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-zinc-700 bg-black/40 backdrop-blur-sm transition-colors focus-within:border-indigo-500 focus-within:bg-indigo-500/10">
        {children}
    </div>
);

// --- MAIN COMPONENT ---

// --- MAIN COMPONENT ---
// import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/ui/social-icons'; // Assuming these are available or defined locally if created previously. If not, I will define them here for safety or import.
// Checking previous turn, I created 'src/components/ui/social-icons.tsx'.

import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/ui/social-icons';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle Register Logic
    };

    return (
        <div className="min-h-screen flex font-geist w-full overflow-hidden bg-black text-white">
            {/* Left column: Form Area (approx 30-35%) */}
            <section className="w-full lg:w-[35%] flex items-center justify-center p-8 lg:p-12 z-20 relative bg-[#09090b] lg:rounded-r-[3rem] shadow-[10px_0_30px_-5px_rgba(0,0,0,0.5)] border-r border-zinc-800">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-2">
                                Buat <span className="text-indigo-500">Akun</span>
                            </h1>
                            <p className="text-zinc-400 font-medium">
                                Gabung komunitas dan mulai perjalananmu.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleRegister}>
                            <div>
                                <label className="text-sm font-bold text-zinc-300 mb-1.5 block">Nama Lengkap</label>
                                <GlassInputWrapper>
                                    <input name="name" type="text" placeholder="Masukkan nama lengkap" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-600 text-white font-medium" />
                                </GlassInputWrapper>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-zinc-300 mb-1.5 block">Alamat Email</label>
                                <GlassInputWrapper>
                                    <input name="email" type="email" placeholder="Masukkan email anda" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-600 text-white font-medium" />
                                </GlassInputWrapper>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-zinc-300 mb-1.5 block">Kata Sandi</label>
                                <GlassInputWrapper>
                                    <div className="relative">
                                        <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Buat kata sandi" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-zinc-600 text-white font-medium" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                                            {showPassword ? <EyeOff className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" /> : <Eye className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" />}
                                        </button>
                                    </div>
                                </GlassInputWrapper>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                                <input type="checkbox" name="terms" className="mt-1 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 font-medium" />
                                <span className="text-zinc-400 font-medium">
                                    Saya menyetujui <Link href="/terms" className="text-indigo-500 hover:underline font-bold">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="text-indigo-500 hover:underline font-bold">Kebijakan Privasi</Link>
                                </span>
                            </div>

                            <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-base">
                                Daftar Sekarang
                            </button>
                        </form>

                        <div className="relative flex items-center justify-center my-4">
                            <span className="w-full border-t border-zinc-800"></span>
                            <span className="px-4 text-xs font-bold text-zinc-600 bg-[#09090b] absolute uppercase tracking-widest">Atau daftar dengan</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button type="button" className="w-full flex items-center justify-center gap-3 border border-zinc-800 rounded-2xl py-3 hover:bg-zinc-800 transition-colors bg-zinc-900/50">
                                <GoogleIcon />
                                <span className="text-zinc-300 font-bold">Google</span>
                            </button>
                            <button type="button" className="w-full flex items-center justify-center gap-3 border border-zinc-800 rounded-2xl py-3 hover:bg-zinc-800 transition-colors bg-zinc-900/50">
                                <AppleIcon />
                                <span className="text-zinc-300 font-bold">Apple ID</span>
                            </button>
                            <button type="button" className="w-full flex items-center justify-center gap-3 border border-zinc-800 rounded-2xl py-3 hover:bg-zinc-800 transition-colors bg-zinc-900/50">
                                <FacebookIcon />
                                <span className="text-zinc-300 font-bold">Facebook</span>
                            </button>
                        </div>

                        <p className="text-center text-sm text-zinc-500 font-medium mt-4">
                            Sudah punya akun? <Link href="/login" className="text-indigo-500 hover:text-indigo-400 hover:underline transition-colors font-bold">Masuk</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* Right column: Light Rays (Rest of width) */}
            <section className="hidden lg:block flex-1 relative bg-black overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12 text-center pointer-events-none">
                    <h2 className="text-6xl font-extrabold text-white mb-8 tracking-tight">
                        Mulai Berjualan <br />
                        <span className="text-indigo-500">Sekarang</span>
                    </h2>
                    <p className="text-zinc-400 text-xl max-w-lg leading-relaxed font-medium">
                        Jutaan pengguna menanti. Buka toko Anda dalam hitungan detik dan berjualan dengan aman.
                    </p>
                </div>

                <LightRays
                    raysOrigin="bottom-center"
                    raysColor="#6366f1" // Indigo (Same as Login)
                    raysSpeed={0.5}
                    lightSpread={0.2}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.3}
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
