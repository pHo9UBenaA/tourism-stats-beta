/**
 * @file State composition for the domestic tourism dashboard feature.
 */
import { createMemo } from "solid-js";

import type { TourismDatabase } from "../../../utils/tourism-db";
import {
	createDatabaseLifecycle,
	type ChartComponent,
	type DatabaseLifecycleState,
} from "./databaseLifecycle";
import { createSelectionState, type SelectionSlice } from "./selectionState";
import { createChartState, type ChartSlice } from "./chartState";

type DatabaseSlice = {
	readonly state: () => DatabaseLifecycleState;
	readonly chartComponent: () => ChartComponent;
	readonly isLoading: () => boolean;
	readonly errorMessage: () => string | null;
};

type DashboardState = {
	readonly database: DatabaseSlice;
	readonly selection: SelectionSlice;
	readonly chart: ChartSlice;
};

function resolveDatabase(
	state: DatabaseLifecycleState,
): TourismDatabase | null {
	return state.kind === "ready" ? state.database : null;
}

function resolveChartComponent(state: DatabaseLifecycleState): ChartComponent {
	return state.kind === "ready" ? state.chartComponent : null;
}

/**
 * Compose feature state and derived view models for the dashboard.
 */
export function createDomesticTourismDashboardState(): DashboardState {
	const lifecycle = createDatabaseLifecycle();
	const databaseAccessor = createMemo<TourismDatabase | null>(() =>
		resolveDatabase(lifecycle.state()),
	);

	const chartComponentAccessor = createMemo<ChartComponent>(() =>
		resolveChartComponent(lifecycle.state()),
	);

	const isDatabaseLoading = createMemo(
		() => lifecycle.state().kind === "loading",
	);
	const databaseError = createMemo(() => {
		const state = lifecycle.state();
		return state.kind === "error" ? state.message : null;
	});

	const selection = createSelectionState({ database: databaseAccessor });
	const chart = createChartState({
		database: databaseAccessor,
		selections: selection.selections,
		selectionSummary: selection.summaryLabel,
	});

	const database: DatabaseSlice = {
		state: lifecycle.state,
		chartComponent: chartComponentAccessor,
		isLoading: isDatabaseLoading,
		errorMessage: databaseError,
	};

	return {
		database,
		selection,
		chart,
	};
}
