import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
	root: __dirname,
	plugins: [
		solid(),
		tsConfigPaths({
			projects: ["../../tsconfig.json"],
		}),
	],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "../../app"),
		},
	},
	publicDir: path.resolve(__dirname, "../../app/public"),
	server: {
		host: "0.0.0.0",
		port: 4173,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
});
