/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Configure remote image patterns for Next.js Image component
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**",
            },
        ],
    },

    // Optimize package imports for smaller bundles
    experimental: {
        optimizePackageImports: ["@trpc/client", "@trpc/react-query"],
    },
};

export default nextConfig;
