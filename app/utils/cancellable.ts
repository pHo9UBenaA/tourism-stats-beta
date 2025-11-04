/**
 * @file Cancellable async utilities.
 * @description Provides a helper to wire AbortController-driven cancellation
 * with Solid's cleanup registration pattern.
 */
export type RegisterCleanup = (cleanup: () => void) => void;

export type CancellableTask = (signal: AbortSignal) => Promise<void>;

/**
 * Run an async task that can be cancelled via the provided cleanup registry.
 */
export function runCancellableTask(
	registerCleanup: RegisterCleanup,
	task: CancellableTask,
): void {
	const controller = new AbortController();
	registerCleanup(() => controller.abort());
	void task(controller.signal);
}
