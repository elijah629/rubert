import solid from "solid-start/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import vercel from "solid-start-vercel";

import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	plugins: [solid({ adapter: vercel() }), wasm(), topLevelAwait()],
	build: {
		target: "esnext"
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	}
});
