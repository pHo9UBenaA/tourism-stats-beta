/**
 * @file State composition for the domestic tourism dashboard feature.
 */
import type { EChartsOption } from "echarts";
import type { EChartsAutoSizeProps } from "echarts-solid";
import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	type Accessor,
	type JSX,
} from "solid-js";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	describeSelectionList,
	toggleSelectionTarget,
	type DomesticTourismSelection,
	type DomesticTourismSeries,
	type RegionLevel,
} from "../types";
import {
	createTourismDatabase,
	queryTargetOptions,
	queryTourismSeries,
} from "../../../utils/tourism-db";
import type { ChartState, OptionsState } from "./types";

const DEFAULT_OPTIONS_STATE: OptionsState = {
	loading: true,
	error: null,
	items: [],
};

const EMPTY_OPTIONS_STATE: OptionsState = {
	loading: false,
	error: null,
	items: [],
};

const DEFAULT_CHART_STATE: ChartState = {
	loading: true,
	data: null,
};

type ChartComponent = ((props: EChartsAutoSizeProps) => JSX.Element) | null;

type DashboardState = {
	isDatabaseLoading: Accessor<boolean>;
	databaseError: Accessor<string | null>;
	chartComponent: Accessor<ChartComponent>;
	prefectureOptions: Accessor<OptionsState>;
	municipalityOptions: Accessor<OptionsState>;
	chartState: Accessor<ChartState>;
	selectedLevel: Accessor<RegionLevel>;
	focusedPrefecture: Accessor<string | null>;
	selectedPrefectures: Accessor<string[]>;
	selectedMunicipalitiesForFocus: Accessor<string[]>;
	isModalOpen: Accessor<boolean>;
	setSelectedLevel: (value: RegionLevel) => void;
	selectPrefectureLevel: () => void;
	selectMunicipalityLevel: () => void;
	openModal: () => void;
	closeModal: () => void;
	togglePrefectureSelection: (value: string) => void;
	focusPrefecture: (value: string) => void;
	toggleMunicipalitySelection: (value: string) => void;
	selections: Accessor<DomesticTourismSelection[]>;
	chartOption: Accessor<EChartsOption | null>;
	selectedLevelLabel: Accessor<string>;
	currentTargetLabel: Accessor<string | null>;
};

const DEFAULT_MULTI_SERIES_TITLE = "Selected Regions";
const CHART_GRID_PADDING = {
	left: 48,
	right: 16,
	top: 72,
	bottom: 56,
} as const;
const AXIS_LABEL_ROTATION_DEGREES = 35;
const SERIES_TYPE_LINE = "line";
const TOOLTIP_TRIGGER_AXIS = "axis";
const Y_AXIS_LABEL = "Population";

type ChartOptionArgs = {
	series: DomesticTourismSeries[];
	title: string;
};

function sortPeriods(periods: string[]) {
	return [...periods].sort((left, right) =>
		left < right ? -1 : left > right ? 1 : 0,
	);
}

function buildSeriesData(periods: string[], series: DomesticTourismSeries) {
	const pointIndex = new Map(
		series.points.map((point) => [point.period, point.population]),
	);
	return periods.map((period) => pointIndex.get(period) ?? null);
}

function buildChartOption({ series, title }: ChartOptionArgs): EChartsOption {
	const periodSet = new Set<string>();
	series.forEach((entry) => {
		entry.points.forEach((point) => {
			periodSet.add(point.period);
		});
	});

	const periods = sortPeriods(Array.from(periodSet));
	const shouldFillArea = series.length === 1;

	return {
		title: {
			text: title,
			left: "center",
		},
		tooltip: {
			trigger: TOOLTIP_TRIGGER_AXIS,
		},
		grid: { ...CHART_GRID_PADDING },
		xAxis: {
			type: "category",
			data: periods,
			axisLabel: {
				rotate: AXIS_LABEL_ROTATION_DEGREES,
			},
		},
		yAxis: {
			type: "value",
			name: Y_AXIS_LABEL,
		},
		series: series.map((entry) => ({
			name: entry.label,
			type: SERIES_TYPE_LINE,
			smooth: true,
			data: buildSeriesData(periods, entry),
			...(shouldFillArea ? { areaStyle: {} } : {}),
		})),
	};
}

/**
 * Compose feature state and derived view models for the dashboard.
 */
export function createDomesticTourismDashboardState(): DashboardState {
	const [databaseState, setDatabaseState] = createSignal<Awaited<
		ReturnType<typeof createTourismDatabase>
	> | null>(null);
	const [databaseError, setDatabaseError] = createSignal<string | null>(null);
	const [isDatabaseLoading, setIsDatabaseLoading] = createSignal(true);
	const [chartComponent, setChartComponent] =
		createSignal<ChartComponent>(null);

	const [prefectureOptions, setPrefectureOptions] = createSignal<OptionsState>(
		DEFAULT_OPTIONS_STATE,
	);
	const [municipalityOptions, setMunicipalityOptions] =
		createSignal<OptionsState>(EMPTY_OPTIONS_STATE);

	const [selectedLevel, setSelectedLevel] = createSignal<RegionLevel>(
		REGION_LEVEL_PREFECTURE,
	);
	const [focusedPrefecture, setFocusedPrefecture] = createSignal<string | null>(
		null,
	);
	const [selectedTargets, setSelectedTargets] = createSignal<
		DomesticTourismSelection[]
	>([]);
	const [chartState, setChartState] =
		createSignal<ChartState>(DEFAULT_CHART_STATE);
	const [isModalOpen, setIsModalOpen] = createSignal(false);

	onMount(async () => {
		setIsDatabaseLoading(true);
		try {
			const [database, chartModule] = await Promise.all([
				createTourismDatabase(),
				import("echarts-solid"),
			]);
			setDatabaseState(database);
			setChartComponent(() => chartModule.EChartsAutoSize);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to start DuckDB";
			setDatabaseError(message);
		} finally {
			setIsDatabaseLoading(false);
		}
	});

	onCleanup(async () => {
		const database = databaseState();
		if (database) {
			await database.dispose();
		}
	});

	createEffect(() => {
		const database = databaseState();
		if (!database) {
			setPrefectureOptions(DEFAULT_OPTIONS_STATE);
			return;
		}

		setPrefectureOptions({
			loading: true,
			error: null,
			items: [],
		});

		let active = true;

		(async () => {
			const result = await queryTargetOptions(database.db, {
				level: REGION_LEVEL_PREFECTURE,
			});
			if (!active) {
				return;
			}

			if (result.ok) {
				const first = result.data.at(0) ?? null;
				setPrefectureOptions({
					loading: false,
					error: null,
					items: result.data,
				});
				setFocusedPrefecture((previous) => {
					if (previous && result.data.includes(previous)) {
						return previous;
					}

					return first;
				});
			} else {
				setPrefectureOptions({
					loading: false,
					error: result.error,
					items: [],
				});
			}
		})();

		onCleanup(() => {
			active = false;
		});
	});

	createEffect(() => {
		const database = databaseState();
		if (!database || selectedLevel() !== REGION_LEVEL_MUNICIPALITY) {
			setMunicipalityOptions(EMPTY_OPTIONS_STATE);
			return;
		}

		const prefectureName = focusedPrefecture();
		if (!prefectureName) {
			setMunicipalityOptions(EMPTY_OPTIONS_STATE);
			return;
		}

		setMunicipalityOptions({
			loading: true,
			error: null,
			items: [],
		});

		let active = true;

		(async () => {
			const result = await queryTargetOptions(database.db, {
				level: REGION_LEVEL_MUNICIPALITY,
				prefectureName,
			});

			if (!active) {
				return;
			}

			if (result.ok) {
				setMunicipalityOptions({
					loading: false,
					error: null,
					items: result.data,
				});
			} else {
				setMunicipalityOptions({
					loading: false,
					error: result.error,
					items: [],
				});
			}
		})();

		onCleanup(() => {
			active = false;
		});
	});

	const selections = createMemo(() => {
		const level = selectedLevel();
		return selectedTargets().filter((entry) => entry.level === level);
	});

	const selectedPrefectures = createMemo(() =>
		selectedTargets()
			.filter((entry) => entry.level === REGION_LEVEL_PREFECTURE)
			.map((entry) => entry.targetName),
	);

	const selectedMunicipalitiesForFocus = createMemo(() => {
		const focus = focusedPrefecture();
		if (!focus) {
			return [];
		}

		return selectedTargets()
			.filter(
				(entry) =>
					entry.level === REGION_LEVEL_MUNICIPALITY &&
					entry.prefectureName === focus,
			)
			.map((entry) => entry.targetName);
	});

	const selectionSummary = createMemo(() =>
		describeSelectionList(selections()),
	);

	createEffect(() => {
		const database = databaseState();
		const activeSelections = selections();

		if (!database || activeSelections.length === 0) {
			setChartState(DEFAULT_CHART_STATE);
			return;
		}

		setChartState({
			loading: true,
			data: null,
		});

		let active = true;

		(async () => {
			const results = await Promise.all(
				activeSelections.map((selection) =>
					queryTourismSeries(database.db, selection),
				),
			);

			if (!active) {
				return;
			}

			const failure = results.find((result) => !result.ok);
			if (failure && !failure.ok) {
				setChartState({
					loading: false,
					data: { ok: false, error: failure.error },
				});
				return;
			}

			const seriesList = results.flatMap((result) =>
				result.ok ? [result.data] : [],
			);

			setChartState({
				loading: false,
				data: { ok: true, data: seriesList },
			});
		})();

		onCleanup(() => {
			active = false;
		});
	});

	const chartOption = createMemo<EChartsOption | null>(() => {
		const result = chartState().data;
		if (!result || !result.ok) {
			return null;
		}

		const summary = selectionSummary() ?? "";
		const title =
			summary.length > 0
				? summary
				: result.data.length === 1
					? (result.data[0]?.label ?? DEFAULT_MULTI_SERIES_TITLE)
					: DEFAULT_MULTI_SERIES_TITLE;

		return buildChartOption({
			series: result.data,
			title,
		});
	});

	const selectedLevelLabel = createMemo(() =>
		selectedLevel() === REGION_LEVEL_PREFECTURE
			? "By Prefecture"
			: "By Municipality",
	);

	const currentTargetLabel = createMemo(() => {
		const summary = selectionSummary();
		return summary && summary.length > 0 ? summary : null;
	});

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const selectPrefectureLevel = () => {
		setSelectedLevel(REGION_LEVEL_PREFECTURE);
	};
	const selectMunicipalityLevel = () => {
		setSelectedLevel(REGION_LEVEL_MUNICIPALITY);
	};
	const togglePrefectureSelection = (value: string) => {
		setSelectedTargets((current) =>
			toggleSelectionTarget(current, {
				level: REGION_LEVEL_PREFECTURE,
				targetName: value,
			}),
		);
	};
	const focusPrefecture = (value: string) => {
		setFocusedPrefecture(value);
	};
	const toggleMunicipalitySelection = (value: string) => {
		const focus = focusedPrefecture();
		if (!focus) {
			return;
		}

		setSelectedTargets((current) =>
			toggleSelectionTarget(current, {
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: value,
				prefectureName: focus,
			}),
		);
	};

	return {
		isDatabaseLoading,
		databaseError,
		chartComponent,
		prefectureOptions,
		municipalityOptions,
		chartState,
		selectedLevel,
		focusedPrefecture,
		selectedPrefectures,
		selectedMunicipalitiesForFocus,
		isModalOpen,
		setSelectedLevel,
		selectPrefectureLevel,
		selectMunicipalityLevel,
		openModal,
		closeModal,
		togglePrefectureSelection,
		focusPrefecture,
		toggleMunicipalitySelection,
		selections,
		chartOption,
		selectedLevelLabel,
		currentTargetLabel,
	};
}
