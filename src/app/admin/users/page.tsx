"use client";

import { api } from "@/trpc/react";

export default function UsersPage() {
    const { data: users, isLoading } = api.admin.getUsers.useQuery();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat data pengguna...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Manage platform users and permissions
                    </p>
                </div>
                {/* <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors">
                    Add User
                </button> */}
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {users?.map((user) => (
                                <tr key={user.user_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-500 font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-white">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                                            user.role === "SELLER" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                                                "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.is_verified && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Verified
                                                </span>
                                            )}
                                            {user.is_suspended && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    Suspended
                                                </span>
                                            )}
                                            {!user.is_verified && !user.is_suspended && (
                                                <span className="text-xs text-zinc-500">Active</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-sm text-brand-primary hover:text-brand-primary-dark">
                                                Edit
                                            </button>
                                            <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
                                                {user.is_suspended ? "Unsuspend" : "Suspend"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                        No users found.
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
