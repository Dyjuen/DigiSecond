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
            icon: "👥",
            trend: "up"
        },
        {
            title: "Total Transactions",
            value: formatIDR(dashboardStats?.totalTransactionVolume ?? 0),
            change: "All time",
            icon: "💰",
            trend: "up"
        },
        {
            title: "Active Listings",
            value: dashboardStats?.activeListings.toString() ?? "0",
            change: "Realtime",
            icon: "📦",
            trend: "up"
        },
        {
            title: "Open Disputes",
            value: dashboardStats?.openDisputes.toString() ?? "0",
            change: "Needs Action",
            icon: "⚖️",
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Monitor your platform metrics and activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const CardContent = (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl">{stat.icon}</span>
                                <span
                                    className={`text-sm font-medium px-2 py-1 rounded-full ${stat.trend === "up"
                                        ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950"
                                        : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950"
                                        }`}
                                >
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                                {stat.title}
                            </h3>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {stat.value}
                            </p>
                        </div>
                    );

                    return stat.href ? (
                        <a key={stat.title} href={stat.href} className="block">
                            {CardContent}
                        </a>
                    ) : (
                        <div key={stat.title}>
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Transaction Volume
                    </h2>
                    <div className="h-64">
                        <Line data={transactionChartData} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        User Growth
                    </h2>
                    <div className="h-64">
                        <Line data={userGrowthChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Pengguna Terbaru
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {dashboardStats?.recentUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white flex items-center gap-3">
                                        <img src={user.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full bg-zinc-100" />
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                            user.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-zinc-100 text-zinc-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {(!dashboardStats?.recentUsers || dashboardStats.recentUsers.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                        Belum ada pengguna data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
