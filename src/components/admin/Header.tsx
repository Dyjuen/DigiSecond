import { useSession, signOut } from "next-auth/react";
import { useSidebarContext } from "./SidebarContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Menu,
    Search,
    Bell,
    ChevronDown,
    User,
    LogOut,
    Settings
} from "lucide-react";

export function EnhancedHeader() {
    const { data: session } = useSession();
    const { toggleSidebar, isMobile } = useSidebarContext();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
                {/* Left: Mobile Menu + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                    </button>

                    <div className="hidden xl:block">
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Admin Dashboard
                        </h2>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                            Control Panel • System Active
                        </p>
                    </div>
                </div>

                {/* Right: Search, Notifications, Theme, User */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="hidden md:block relative group">
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-72 px-5 py-2 pl-11 text-sm border-0 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group-hover:bg-zinc-200/50 dark:group-hover:bg-white/10"
                        />
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all active:scale-95">
                        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                        >
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-600/20">
                                {session?.user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="hidden sm:block text-left pr-1">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    {session?.user?.role || "ADMIN"}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-3xl shadow-2xl z-50 overflow-hidden origin-top-right whitespace-nowrap"
                                    >
                                        <div className="p-6 bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5 relative overflow-hidden group">
                                            {/* Decorative glow */}
                                            <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Authenticated User</p>
                                            <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                                                {session?.user?.email}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Online</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">{session?.user?.role}</span>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                                            >
                                                <User className="w-4 h-4" />
                                                Account Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                                            >
                                                <Settings className="w-4 h-4" />
                                                System Settings
                                            </button>
                                            <div className="h-px bg-zinc-100 dark:bg-white/5 my-2 mx-4" />
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    signOut({ callbackUrl: "/" });
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout Session
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
