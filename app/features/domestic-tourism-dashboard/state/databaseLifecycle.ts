/**
 * @file Database lifecycle state for the domestic tourism dashboard.
 */
import type { EChartsAutoSizeProps } from "echarts-solid";
import {
	createSignal,
	onCleanup,
	onMount,
	type Accessor,
	type JSX,
} from "solid-js";

import type { TourismDatabase } from "../../../utils/tourism-db";
import { createTourismDatabase } from "../../../utils/tourism-db";

const ERROR_FALLBACK_MESSAGE = "Failed to start DuckDB";

export type ChartComponent =
	| ((props: EChartsAutoSizeProps) => JSX.Element)
	| null;

export type DatabaseState =
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| {
			kind: "ready";
			database: TourismDatabase;
			chartComponent: ChartComponent;
	  };

type DatabaseStateSlice = {
	readonly state: Accessor<DatabaseState>;
};

/**
 * Manage DuckDB instantiation and cleanup alongside the chart component module.
 */
export function createDatabaseState(): DatabaseStateSlice {
	const [state, setState] = createSignal<DatabaseState>({
		kind: "loading",
	});

	onMount(async () => {
		setState({ kind: "loading" });

		let databaseResult: Awaited<
			ReturnType<typeof createTourismDatabase>
		> | null = null;

		try {
			const chartModulePromise = import("echarts-solid");
			databaseResult = await createTourismDatabase();
			const chartModule = await chartModulePromise;

			if (!databaseResult.ok) {
				setState({ kind: "error", message: databaseResult.error });
				return;
			}

			setState({
				kind: "ready",
				database: databaseResult.data,
				chartComponent: chartModule.EChartsAutoSize ?? null,
			});
		} catch (error) {
			if (databaseResult && databaseResult.ok) {
				await databaseResult.data.dispose();
			}

			const message =
				error instanceof Error ? error.message : ERROR_FALLBACK_MESSAGE;
			setState({ kind: "error", message });
		}
	});

	onCleanup(async () => {
		const current = state();
		if (current.kind === "ready") {
			await current.database.dispose();
		}
	});

	return { state };
}
