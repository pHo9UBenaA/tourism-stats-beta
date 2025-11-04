import { describe, expect, it } from "vitest";

import { runCancellableTask } from "../app/utils/cancellable";

describe("runCancellableTask", () => {
	it("aborts the task when cleanup runs", async () => {
		const cleanupCallbacks: Array<() => void> = [];
		let aborted = false;

		runCancellableTask(
			(cleanup) => cleanupCallbacks.push(cleanup),
			async (signal) => {
				signal.addEventListener("abort", () => {
					aborted = true;
				});

				await Promise.resolve();
			},
		);

		cleanupCallbacks[0]?.();
		await Promise.resolve();

		expect(aborted).toBe(true);
	});
});
