import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "path";

const SERVER_HOST = process.env.VITE_HOST ?? "0.0.0.0";
const SERVER_PORT = Number(process.env.VITE_PORT ?? "4173");

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
		host: SERVER_HOST,
		port: SERVER_PORT,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
});
