"use client";

import { useEffect, useState } from "react";

interface MobileCallbackClientProps {
    token: string;
    userName: string;
    deepLinkScheme: string;
}

/**
 * Mobile Callback Client Component
 * 
 * Renders a button that deep links to the mobile app with the JWT token.
 * Due to browser security, we can't auto-redirect to custom schemes,
 * so we require explicit user interaction.
 */
export default function MobileCallbackClient({ token, userName, deepLinkScheme }: MobileCallbackClientProps) {
    const [copied, setCopied] = useState(false);

    // Generate deep link based on scheme
    // Development (Expo Go): exp://10.0.2.2:8081/--/auth-callback?token=...
    // Production: digisecond://auth-callback?token=...
    const deepLink = deepLinkScheme === "development"
        ? `exp://10.0.2.2:8081/--/auth-callback?token=${token}`
        : `digisecond://auth-callback?token=${token}`;

    const handleOpenApp = () => {
        window.location.href = deepLink;
    };

    const handleCopyToken = async () => {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-attempt to open app on mount (may not work on all browsers)
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = deepLink;
        }, 1000);
        return () => clearTimeout(timer);
    }, [deepLink]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Authentication Successful
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Welcome back, {userName}!
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                        Tap the button below to return to the DigiSecond mobile app.
                    </p>
                </div>

                {/* Open App Button */}
                <button
                    onClick={handleOpenApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    Open DigiSecond App
                </button>

                {/* Fallback: Copy Token */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-3">
                        App didn&apos;t open? Copy the token manually:
                    </p>
                    <button
                        onClick={handleCopyToken}
                        className="w-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-sm py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        {copied ? "✓ Copied!" : "Copy Token"}
                    </button>
                </div>

                {/* Auto-redirect notice */}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                    Attempting to open app automatically...
                </p>
            </div>
        </div>
    );
}
