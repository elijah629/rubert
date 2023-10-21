import solid from "solid-start/vite";
import vercel from "solid-start-vercel";

import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	plugins: [
		solid({
			adapter: vercel()
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
