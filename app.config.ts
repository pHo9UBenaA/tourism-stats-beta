import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";
import path from "node:path";

const solidWebShimPlugin = () => ({
	name: "tourism-solid-web-shim",
	config: () => ({
		resolve: {
			alias: [
				{
					find: /^solid-js\/web$/,
					replacement: path.resolve(
						process.cwd(),
						"app/shims/solid-js-web.ts",
					),
				},
			],
		},
	}),
});

const sharedPlugins = () => [
	solidWebShimPlugin(),
	solid(),
	tanstackStart({
		srcDirectory: "app",
	}),
	tsConfigPaths({
		projects: ["./tsconfig.json"],
	}),
];

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			base: "/",
			dir: "./app/public",
		},
		{
			name: "client",
			type: "client",
			base: "/",
			handler: "./app/client.tsx",
			plugins: sharedPlugins,
		},
		{
			name: "ssr",
			type: "http",
			base: "/",
			handler: "./app/ssr.tsx",
			plugins: sharedPlugins,
		},
	],
});
