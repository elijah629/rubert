import solid from "solid-start/vite";
import wasm from "vite-plugin-wasm";
import vercel from "solid-start-vercel";
import tla from "vite-plugin-top-level-await";

import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	plugins: [solid({ adapter: vercel() }), wasm(), tla()],
	build: {
		target: "esnext"
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	}
});
