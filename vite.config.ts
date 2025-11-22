import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 3000,
	},
	plugins: [
		react(),
		mode === "development" && componentTagger(),
		VitePWA({
			strategies: "generateSW",
			registerType: "autoUpdate",
			manifest: {
				name: "UniNav",
				short_name: "UniNav",
				description:
					"UniNav is a collaborative university study materials platform that organizes and simplifies resource discovery for students.",
				theme_color: "#0410A2",
				background_color: "#ffffff",
				display: "standalone", // Removes browser UI
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
			devOptions: {
				enabled: true,
			},
		}),
	].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
