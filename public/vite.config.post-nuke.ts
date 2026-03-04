/**
 * POST-NUKE vite.config.ts
 *
 * After the nuke deploy has run (all users loaded the page once and had
 * their caches cleared), replace the contents of vite.config.ts with this.
 *
 * The key changes vs the old generateSW config:
 *   - strategies: "injectManifest"  (uses src/sw.ts instead of auto-generating)
 *   - srcDir: "src" / filename: "sw.ts"
 *   - No workbox.runtimeCaching block — rules now live in src/sw.ts
 */
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "lovable-tagger";
import {VitePWA} from "vite-plugin-pwa";
import {handler} from "tailwindcss-animate";

export default defineConfig(({mode}) => ({
    server: {
        host: "::",
        port: 3000,
    },
    plugins: [
        react(),
        mode === "development" && componentTagger(),
        VitePWA({
            includeAssets: ["favicon.ico", "apple-touch-icon.png"],
            strategies: "injectManifest",
            srcDir: "src",
            filename: "sw.ts",
            registerType: "autoUpdate",
            manifest: {
                name: "UniNav",
                short_name: "UniNav",
                description:
                    "UniNav is a collaborative university study materials platform that organizes and simplifies resource discovery for students.",
                theme_color: "#0410A2",
                background_color: "#ffffff",
                display: "standalone",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-64x64.png",
                        sizes: "64x64",
                        type: "image/png",
                    },
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "maskable-icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            injectManifest: {
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
            },
            devOptions: {
                enabled: false,
            },
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
