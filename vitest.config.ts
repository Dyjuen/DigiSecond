import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "node",
        globals: true,
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["**/node_modules/**", "**/mobile/**"],
        env: {
            // Load NEXTAUTH_SECRET from .env for tests
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "test-secret-key-do-not-use-in-production",
        },
    },
});
