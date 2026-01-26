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
                    primary: "#10b981",
                    "primary-light": "#34d399",
                    "primary-dark": "#059669",
                    "primary-subtle": "#d1fae5",
                    secondary: "#0ea5e9",
                    "secondary-dark": "#0284c7",
                },
                // Accent colors (premium)
                accent: {
                    gold: "#f59e0b",
                    "gold-light": "#fbbf24",
                    "gold-dark": "#d97706",
                },
                // Semantic colors
                success: "#10b981",
                warning: "#f59e0b",
                error: "#ef4444",
                "error-light": "#fecaca",
                info: "#0ea5e9",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-primary": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "gradient-hero": "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
            },
            boxShadow: {
                "3d": "0 20px 40px rgba(16, 185, 129, 0.15)",
                "3d-hover": "0 30px 60px rgba(16, 185, 129, 0.25)",
                "card": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                "card-hover": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
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
            },
        },
    },
    plugins: [],
};

export default config;
