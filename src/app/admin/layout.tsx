"use client";

import { AdminGuard } from "@/components/rbac";
import { SidebarProvider } from "@/components/admin/SidebarContext";
import { EnhancedSidebar } from "@/components/admin/Sidebar";
import { EnhancedHeader } from "@/components/admin/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard redirectTo="/login" fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">Checking permissions...</p>
                </div>
            </div>
        }>
            <SidebarProvider>
                <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
                    <EnhancedSidebar />

                    <div className="flex-1 flex flex-col min-w-0">
                        <EnhancedHeader />

                        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                            <div className="max-w-[1600px] mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </AdminGuard>
    );
}
