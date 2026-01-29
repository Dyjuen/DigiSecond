"use client";

import { useState } from "react";

interface Ticket {
    id: string;
    user: string;
    subject: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    created: string;
}

// Dummy data
const dummyTickets: Ticket[] = [
    { id: "1", user: "John Doe", subject: "Cannot access my account", status: "OPEN", priority: "HIGH", created: "2026-01-27 10:30" },
    { id: "2", user: "Jane Smith", subject: "Payment not received", status: "IN_PROGRESS", priority: "MEDIUM", created: "2026-01-27 09:15" },
    { id: "3", user: "Bob Wilson", subject: "How to verify my account?", status: "RESOLVED", priority: "LOW", created: "2026-01-26 16:45" },
    { id: "4", user: "Alice Brown", subject: "Dispute resolution inquiry", status: "OPEN", priority: "HIGH", created: "2026-01-27 11:00" },
];

export default function SupportPage() {
    const [tickets] = useState<Ticket[]>(dummyTickets);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "IN_PROGRESS": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
            case "RESOLVED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "MEDIUM": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
            case "LOW": return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
            default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Customer Support</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Manage support tickets and customer inquiries
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium">
                        {tickets.filter(t => t.status === "OPEN").length} Open
                    </span>
                    <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-medium">
                        {tickets.filter(t => t.status === "IN_PROGRESS").length} In Progress
                    </span>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Ticket ID
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Subject
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm text-zinc-900 dark:text-white">
                                        #{ticket.id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {ticket.user}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {ticket.subject}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {ticket.created}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-sm text-brand-primary hover:text-brand-primary-dark">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
