"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { motion, AnimatePresence } from "motion/react";
import {
    Users,
    Wallet,
    Package,
    Scale,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: dashboardStats, isLoading } = api.admin.getDashboardStats.useQuery(undefined, {
        enabled: !!session?.user && session.user.role === "ADMIN"
    });

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        if (session.user.role !== "ADMIN") {
            router.push("/");
            return;
        }
    }, [session, status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat data dashboard...</p>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") {
        return null; // Will redirect
    }

    // Format currency helper
    const formatIDR = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const stats = [
        {
            title: "Total Users",
            value: dashboardStats?.totalUsers.toString() ?? "0",
            change: "Live",
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
            trend: "up"
        },
        {
            title: "Total Transactions",
            value: formatIDR(dashboardStats?.totalTransactionVolume ?? 0),
            change: "All time",
            icon: Wallet,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
            trend: "up"
        },
        {
            title: "Active Listings",
            value: dashboardStats?.activeListings.toString() ?? "0",
            change: "Realtime",
            icon: Package,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100 dark:bg-amber-900/30",
            trend: "up"
        },
        {
            title: "Open Disputes",
            value: dashboardStats?.openDisputes.toString() ?? "0",
            change: "Needs Action",
            icon: Scale,
            color: "text-rose-600 dark:text-rose-400",
            bgColor: "bg-rose-100 dark:bg-rose-900/30",
            trend: dashboardStats?.openDisputes && dashboardStats.openDisputes > 0 ? "down" : "up"
        },
    ] as (typeof stats[0] & { href?: string })[];

    // Chart data
    const transactionChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "Transaction Volume (Million IDR)",
                data: [45, 52, 48, 65, 72, 80, 134],
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const userGrowthChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "New Users",
                data: [120, 180, 250, 320, 450, 680, 1234],
                borderColor: "rgb(168, 85, 247)",
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                borderColor: "rgba(99, 102, 241, 0.5)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#71717a",
                },
            },
            y: {
                grid: {
                    color: "rgba(113, 113, 122, 0.1)",
                },
                ticks: {
                    color: "#71717a",
                },
            },
        },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Monitor your platform metrics and activity in real-time
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700/50 outline outline-4 outline-zinc-100/50 dark:outline-zinc-800/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live System Status
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    const CardContent = (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group relative bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-white/5 p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-pointer h-full overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${stat.bgColor}`} />

                            <div className="flex items-center justify-between mb-4 md:mb-5">
                                <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.color} transition-colors duration-300`}>
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${stat.trend === "up"
                                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10"
                                        : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-400/10"
                                        }`}
                                >
                                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                                {stat.title}
                            </h3>
                            <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                                {stat.value}
                            </p>
                        </motion.div>
                    );

                    return stat.href ? (
                        <Link key={stat.title} href={stat.href} className="block">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={stat.title}>
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                            Transaction Volume
                        </h2>
                        <div className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">
                            +12% vs last month
                        </div>
                    </div>
                    <div className="h-72">
                        <Line data={transactionChartData} options={chartOptions} />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                            User Growth
                        </h2>
                        <div className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">
                            +45% this year
                        </div>
                    </div>
                    <div className="h-72">
                        <Line data={userGrowthChartData} options={chartOptions} />
                    </div>
                </motion.div>
            </div>

            {/* Recent Users */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            Pengguna Terbaru
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1 font-medium italic">Menampilkan 5 pendaftaran akun terakhir</p>
                    </div>
                    <button className="text-xs font-bold text-brand-primary hover:underline transition-all">Lihat Semua User</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50/50 dark:bg-white/5 text-zinc-500 font-bold border-b border-zinc-200 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-5 uppercase tracking-widest text-[10px]">Nama</th>
                                <th className="px-8 py-5 uppercase tracking-widest text-[10px]">Email</th>
                                <th className="px-8 py-5 uppercase tracking-widest text-[10px]">Role</th>
                                <th className="px-8 py-5 uppercase tracking-widest text-[10px]">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {dashboardStats?.recentUsers.map((user) => (
                                <tr key={user.user_id} className="group hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-5 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-4">
                                        <div className="relative">
                                            <img src={user.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-10 h-10 rounded-2xl bg-zinc-100 object-cover" />
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium">Status: Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-zinc-600 dark:text-zinc-400 font-medium">{user.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' :
                                            user.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
                                                {new Date(user.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {new Date(user.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!dashboardStats?.recentUsers || dashboardStats.recentUsers.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-zinc-500 italic font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="w-8 h-8 opacity-20" />
                                            Belum ada data pengguna terbaru.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
