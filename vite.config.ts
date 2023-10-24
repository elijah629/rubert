import solid from "solid-start/vite";
import vercel from "solid-start-vercel";

import { defineConfig } from "vite";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: null,
			devOptions: {
				enabled: true,
				type: "module"
			},
			workbox: {
				// Adds "/" route. This has access to all other routes through the solid router. Will not work for dynamic URL's
				additionalManifestEntries: [{ revision: null, url: "/" }],
				globPatterns: ["**/*"]
			},
			manifest: {
				start_url: "/",
				name: "Rubert",
				short_name: "Rubert",
				theme_color: "#000000",
				display: "standalone",
				orientation: "portrait",
				icons: [
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						purpose: "any maskable",
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png"
					}
				]
			}
		}),
		solid({
			// adapter: vercel()
		})
	],
	build: {
		target: "esnext"
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	}
});
