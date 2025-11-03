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
	type DomesticTourismSelection,
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
	selectedPrefecture: Accessor<string | null>;
	selectedMunicipality: Accessor<string | null>;
	isModalOpen: Accessor<boolean>;
	setSelectedLevel: (value: RegionLevel) => void;
	setSelectedPrefecture: (value: string | null) => void;
	setSelectedMunicipality: (value: string | null) => void;
	selectPrefectureLevel: () => void;
	selectMunicipalityLevel: () => void;
	openModal: () => void;
	closeModal: () => void;
	selection: Accessor<DomesticTourismSelection | null>;
	chartOption: Accessor<EChartsOption | null>;
	selectedLevelLabel: Accessor<string>;
	currentTargetLabel: Accessor<string | null>;
};

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
	const [selectedPrefecture, setSelectedPrefecture] = createSignal<
		string | null
	>(null);
	const [selectedMunicipality, setSelectedMunicipality] = createSignal<
		string | null
	>(null);
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
				setSelectedPrefecture((previous) => previous ?? first);
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

		const prefectureName = selectedPrefecture();
		if (!prefectureName) {
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
				const first = result.data.at(0) ?? null;
				setMunicipalityOptions({
					loading: false,
					error: null,
					items: result.data,
				});
				setSelectedMunicipality((previous) => previous ?? first);
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

	const selection = createMemo<DomesticTourismSelection | null>(() => {
		const prefectureName = selectedPrefecture();
		if (!prefectureName) {
			return null;
		}

		if (selectedLevel() === REGION_LEVEL_PREFECTURE) {
			return {
				level: REGION_LEVEL_PREFECTURE,
				targetName: prefectureName,
			};
		}

		const municipalityName = selectedMunicipality();
		if (!municipalityName) {
			return null;
		}

		return {
			level: REGION_LEVEL_MUNICIPALITY,
			targetName: municipalityName,
			prefectureName,
		};
	});

	createEffect(() => {
		const database = databaseState();
		const currentSelection = selection();

		if (!database || !currentSelection) {
			setChartState(DEFAULT_CHART_STATE);
			return;
		}

		setChartState({
			loading: true,
			data: null,
		});

		let active = true;

		(async () => {
			const result = await queryTourismSeries(database.db, currentSelection);
			if (!active) {
				return;
			}

			setChartState({
				loading: false,
				data: result,
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

		const points = result.data.points;

		return {
			title: {
				text: result.data.label,
				left: "center",
			},
			tooltip: {
				trigger: "axis",
			},
			grid: { left: 48, right: 16, top: 72, bottom: 56 },
			xAxis: {
				type: "category",
				data: points.map((point) => point.period),
				axisLabel: {
					rotate: 35,
				},
			},
			yAxis: {
				type: "value",
				name: "Population",
			},
			series: [
				{
					type: "line",
					smooth: true,
					data: points.map((point) => point.population),
					areaStyle: {},
				},
			],
		};
	});

	const selectedLevelLabel = createMemo(() =>
		selectedLevel() === REGION_LEVEL_PREFECTURE
			? "By Prefecture"
			: "By Municipality",
	);

	const currentTargetLabel = createMemo(() => {
		if (selectedLevel() === REGION_LEVEL_PREFECTURE) {
			return selectedPrefecture();
		}

		const prefecture = selectedPrefecture();
		const municipality = selectedMunicipality();
		return prefecture && municipality
			? `${prefecture} / ${municipality}`
			: null;
	});

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const selectPrefectureLevel = () => {
		setSelectedLevel(REGION_LEVEL_PREFECTURE);
		setSelectedMunicipality(null);
	};
	const selectMunicipalityLevel = () => {
		setSelectedLevel(REGION_LEVEL_MUNICIPALITY);
	};

	return {
		isDatabaseLoading,
		databaseError,
		chartComponent,
		prefectureOptions,
		municipalityOptions,
		chartState,
		selectedLevel,
		selectedPrefecture,
		selectedMunicipality,
		isModalOpen,
		setSelectedLevel,
		setSelectedPrefecture,
		setSelectedMunicipality,
		selectPrefectureLevel,
		selectMunicipalityLevel,
		openModal,
		closeModal,
		selection,
		chartOption,
		selectedLevelLabel,
		currentTargetLabel,
	};
}
