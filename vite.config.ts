import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "lovable-tagger";
import {VitePWA} from "vite-plugin-pwa";
import {handler} from "tailwindcss-animate";

// https://vitejs.dev/config/
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
            strategies: "generateSW",
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
            workbox: {
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            },
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/faculty\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/faculty\/.*/i,
                        handler: "StaleWhileRevalidate",
                        method: "GET",
                        options: {
                            cacheName: 'faculty-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/department\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/department\/.*/i,
                        handler: "StaleWhileRevalidate",
                        method: "GET",
                        options: {
                            cacheName: 'department-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 7 
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Never cache user-specific bookmark data — must reflect current session
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/user\/bookmarks\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/user\/bookmarks\/.*/i,
                        handler: "NetworkOnly",
                        method: "GET"
                    },
                    // Don't cache requests for generating download links
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/materials\/download\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/materials\/download\/.*/i,
                        handler: "NetworkOnly",
                        method: "GET"
                    },
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/materials\/recent/i : /^https:\/\/uninav-backend-v2.onrender.com\/materials\/recent/i,
                        handler: "StaleWhileRevalidate",
                        method: "GET",
                        options: {
                            cacheName: "recent-materials-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 7
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // TODO: Separate cache for individual materials due to maxEntries quota
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/materials\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/materials\/.*/i,
                        handler: "StaleWhileRevalidate",
                        method: "GET",
                        options: {
                            cacheName: 'materials-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 14 // 2 weeks
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // TODO: Separate cache for individual courses due to maxEntries quota
                    {
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/courses\/.*/i : /^https:\/\/uninav-backend-v2.onrender.com\/courses\/.*/i,
                        handler: "StaleWhileRevalidate",
                        method: "GET",
                        options: {
                            cacheName: 'courses-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 14 // 2 weeks
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Never cache auth check — must always verify live session with the server
                        urlPattern: mode === "development" ? /^http:\/\/localhost:3200\/auth\/check/i : /^https:\/\/uninav-backend-v2.onrender.com\/auth\/check/i,
                        handler: "NetworkOnly",
                        method: "GET"
                    }
                ]
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
