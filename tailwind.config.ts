import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Brand colors - shared with mobile (see shared-design-tokens)
                brand: {
                    primary: "#6366f1",
                    "primary-dark": "#4f46e5",
                },
                // Accent colors (premium)
                accent: {
                    gold: "#f59e0b",
                    "gold-light": "#fbbf24",
                    "gold-dark": "#d97706",
                },
                // Semantic colors
                success: "#22c55e",
                warning: "#f59e0b",
                error: "#ef4444",
                "error-light": "#fecaca",
                info: "#06b6d4",
            },
            fontFamily: {
                sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "var(--font-sans)", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                "gradient-hero": "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
                "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
            },
            boxShadow: {
                "3d": "0 20px 40px rgba(99, 102, 241, 0.15)",
                "3d-hover": "0 30px 60px rgba(99, 102, 241, 0.25)",
                "card": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                "card-hover": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
                "marquee": "marquee var(--duration) linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                marquee: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(calc(-100% - var(--gap)))" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
