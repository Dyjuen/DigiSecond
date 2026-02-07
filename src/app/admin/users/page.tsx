"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const { data: users, isLoading } = api.admin.getUsers.useQuery();

    // Fetch details for selected user
    const { data: userDetails, isLoading: isLoadingDetails } = api.admin.getUserDetails.useQuery(
        { user_id: selectedUserId! },
        { enabled: !!selectedUserId }
    );

    function ImageWithFallback({ src, alt, fallback, className }: { src: string | null | undefined, alt: string, fallback: React.ReactNode, className?: string }) {
        const [error, setError] = useState(false);

        if (!src || error) {
            return fallback;
        }

        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setError(true)}
            />
        );
    }

    function UserDrawer({ userId, onClose }: { userId: string, onClose: () => void }) {
        if (!userId) return null;

        // Ensure userDetails is the one for the selected userId
        // Note: The parent query updates based on selectedUserId, so userDetails is correct.

        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-zinc-950 z-50 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
                >
                    <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-white">User Details</h2>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {isLoadingDetails || !userDetails ? (
                            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-3">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="animate-pulse text-sm font-medium">Loading user data...</span>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Profile Header */}
                                <div className="flex items-start gap-5">
                                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm relative group">
                                        <ImageWithFallback
                                            src={userDetails.avatar_url}
                                            alt={userDetails.name}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-inner">
                                                    {userDetails.name.charAt(0).toUpperCase()}
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{userDetails.name}</h3>
                                        <p className="text-zinc-500 text-sm mb-3 truncate">{userDetails.email}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={userDetails.role === "ADMIN" ? "default" : userDetails.role === "SELLER" ? "success" : "outline"}>
                                                {userDetails.role}
                                            </Badge>
                                            {userDetails.is_verified && <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">Verified</Badge>}
                                            {userDetails.is_suspended && <Badge variant="error" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Suspended</Badge>}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Sales</div>
                                        <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{userDetails._count.sales}</div>
                                    </div>
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Purchases</div>
                                        <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{userDetails._count.purchases}</div>
                                    </div>
                                </div>

                                {/* ID Verification (KTP) */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500">Identity Verification</h4>
                                    <div className="p-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                        {userDetails.id_card_url ? (
                                            <div className="space-y-2">
                                                <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden group">
                                                    <ImageWithFallback
                                                        src={userDetails.id_card_url}
                                                        alt="KTP"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        fallback={
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                                                                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                <p className="text-xs font-medium">Image unavailable</p>
                                                            </div>
                                                        }
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a href={userDetails.id_card_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors border border-white/30">
                                                            View Full Size
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="px-3 pb-2 text-xs text-zinc-500 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Uploaded on {new Date(userDetails.updated_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg m-2">
                                                <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-sm font-medium">No ID document uploaded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Listings */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500">Recent Listings</h4>
                                    <div className="space-y-3">
                                        {userDetails.listings?.length > 0 ? (
                                            userDetails.listings.map(listing => (
                                                <div key={listing.listing_id} className="group flex gap-3 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all hover:border-zinc-200 dark:hover:border-zinc-700">
                                                    <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden shrink-0">
                                                        <ImageWithFallback
                                                            src={listing.photo_urls?.[0]}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            fallback={<div className="w-full h-full bg-zinc-300 dark:bg-zinc-700 animate-pulse"></div>}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-medium text-sm truncate text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors">{listing.title}</h5>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">Rp {listing.price.toLocaleString()}</span>
                                                            <Badge variant={listing.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                                                                {listing.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-zinc-500 text-sm italic py-4 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-lg">No listings found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex gap-3">
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">Suspend Account</Button>
                            <Button variant="outline" className="flex-1">Reset Password</Button>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    }


    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat data pengguna...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Manage platform users and permissions
                    </p>
                </div>
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
                                <tr key={user.user_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 group cursor-pointer" onClick={() => setSelectedUserId(user.user_id)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-500 font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors">
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
                                                <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Verified</Badge>
                                            )}
                                            {user.is_suspended && (
                                                <Badge variant="error" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Suspended</Badge>
                                            )}
                                            {!user.is_verified && !user.is_suspended && (
                                                <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600">Active</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUserId(user.user_id);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedUserId && (
                    <UserDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
