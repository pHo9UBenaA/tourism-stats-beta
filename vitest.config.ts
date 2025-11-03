/**
 * @file Vitest configuration restricted to root-level unit tests.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		environment: "node",
	},
});
