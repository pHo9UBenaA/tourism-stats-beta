/**
 * @file Chart state management for the domestic tourism dashboard.
 */
import type { EChartsOption } from "echarts";
import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	type Accessor,
} from "solid-js";

import { type DomesticTourismSelection } from "../../../../src/types/domestic-tourism";
import type { TourismDatabase } from "../../../utils/tourism-db";
import { queryTourismSeries } from "../../../utils/tourism-db";
import { buildTourismChartOption } from "./chartOption";
import type { ChartState } from "./types";

type CreateChartStateArgs = {
	readonly database: Accessor<TourismDatabase | null>;
	readonly selections: Accessor<DomesticTourismSelection[]>;
	readonly selectionSummary: Accessor<string | null>;
};

export type ChartSlice = {
	readonly state: Accessor<ChartState>;
	readonly option: Accessor<EChartsOption | null>;
};

/**
 * Compose chart loading state and derived ECharts configuration.
 */
export function createChartState({
	database,
	selections,
	selectionSummary,
}: CreateChartStateArgs): ChartSlice {
	const [state, setState] = createSignal<ChartState>({ kind: "idle" });

	createEffect(() => {
		const db = database();
		const activeSelections = selections();

		if (!db || activeSelections.length === 0) {
			setState({ kind: "idle" });
			return;
		}

		setState({ kind: "loading" });
		let active = true;

		(async () => {
			const results = await Promise.all(
				activeSelections.map((selection) =>
					queryTourismSeries(db.db, selection),
				),
			);

			if (!active) {
				return;
			}

			const failure = results.find((result) => !result.ok);
			if (failure && !failure.ok) {
				setState({ kind: "error", message: failure.error });
				return;
			}

			const seriesList = results.flatMap((result) =>
				result.ok ? [result.data] : [],
			);

			setState({ kind: "ready", series: seriesList });
		})();

		onCleanup(() => {
			active = false;
		});
	});

	const option = createMemo<EChartsOption | null>(() => {
		const current = state();
		if (current.kind !== "ready") {
			return null;
		}

		return buildTourismChartOption({
			series: current.series,
			summary: selectionSummary(),
		});
	});

	return {
		state,
		option,
	};
}
