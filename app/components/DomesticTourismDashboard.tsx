/**
 * @file Domestic tourism dashboard composed of DuckDB-backed queries and ECharts.
 */
import type { EChartsOption } from "echarts";
import type { EChartsAutoSizeProps } from "echarts-solid";
import {
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	type DomesticTourismSelection,
	type RegionLevel,
} from "../../src/types/domestic-tourism";
import type { DomesticTourismSeries } from "../../src/types/domestic-tourism";
import type { FetchResult } from "../../src/types/fetch";
import {
	createTourismDatabase,
	queryTargetOptions,
	queryTourismSeries,
} from "../utils/tourism-db";

type ChartState = {
	loading: boolean;
	data: FetchResult<DomesticTourismSeries, string> | null;
};

type OptionsState = {
	loading: boolean;
	error: string | null;
	items: string[];
};

const DEFAULT_OPTIONS_STATE: OptionsState = {
	loading: true,
	error: null,
	items: [],
};

const DEFAULT_CHART_STATE: ChartState = {
	loading: true,
	data: null,
};

/**
 * Domestic tourism dashboard backed by DuckDB WASM.
 */
export function DomesticTourismDashboard() {
	if (typeof window === "undefined") {
		return (
			<div class="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
				Loading domestic tourism dashboard…
			</div>
		);
	}

	const [databaseState, setDatabaseState] = createSignal<Awaited<
		ReturnType<typeof createTourismDatabase>
	> | null>(null);
	const [databaseError, setDatabaseError] = createSignal<string | null>(null);
	const [isDatabaseLoading, setIsDatabaseLoading] = createSignal(true);
	const [chartComponent, setChartComponent] = createSignal<
		((props: EChartsAutoSizeProps) => JSX.Element) | null
	>(null);

	const [prefectureOptions, setPrefectureOptions] = createSignal<OptionsState>(
		DEFAULT_OPTIONS_STATE,
	);
	const [municipalityOptions, setMunicipalityOptions] =
		createSignal<OptionsState>({
			loading: false,
			error: null,
			items: [],
		});

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
			setMunicipalityOptions({
				loading: false,
				error: null,
				items: [],
			});
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

	const currentSelection = createMemo<DomesticTourismSelection | null>(() => {
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
		const selection = currentSelection();

		if (!database || !selection) {
			setChartState(DEFAULT_CHART_STATE);
			return;
		}

		setChartState({
			loading: true,
			data: null,
		});

		let active = true;

		(async () => {
			const result = await queryTourismSeries(database.db, selection);
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

	return (
		<div class="flex flex-col gap-6">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Domestic Tourism Information</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Interactively explore monthly population indicators from the domestic
					tourism dataset.
				</p>
			</header>

			<Show when={isDatabaseLoading()}>
				<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
					Initialising DuckDB and loading JSON datasets…
				</div>
			</Show>

			<Show when={!isDatabaseLoading() && databaseError()}>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
					{databaseError()}
				</div>
			</Show>

			<Show when={!isDatabaseLoading() && !databaseError()}>
				<section class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
					<div class="flex flex-wrap items-center gap-3">
						<div class="flex items-center gap-2">
							<button
								type="button"
								class={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
									selectedLevel() === REGION_LEVEL_PREFECTURE
										? "bg-blue-600 text-white shadow"
										: "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
								}`}
								onClick={() => {
									setSelectedLevel(REGION_LEVEL_PREFECTURE);
									setSelectedMunicipality(null);
								}}
							>
								By Prefecture
							</button>

							<button
								type="button"
								class={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
									selectedLevel() === REGION_LEVEL_MUNICIPALITY
										? "bg-blue-600 text-white shadow"
										: "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
								}`}
								onClick={() => {
									setSelectedLevel(REGION_LEVEL_MUNICIPALITY);
								}}
							>
								By Municipality
							</button>
						</div>

						<button
							type="button"
							class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
							onClick={() => setIsModalOpen(true)}
						>
							Select Region
						</button>

						<Show when={currentTargetLabel()}>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								Selected: {currentTargetLabel()}
							</span>
						</Show>
					</div>

					<Show when={chartState().loading}>
						<div class="h-80 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
							Loading chart data…
						</div>
					</Show>

					<Show
						when={
							!chartState().loading &&
							chartState().data &&
							!chartState().data?.ok
						}
					>
						<div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
							{chartState().data?.error}
						</div>
					</Show>

					<Show
						when={!chartState().loading && chartOption() && chartComponent()}
					>
						<div class="h-80 w-full">
							{(() => {
								const Component = chartComponent();
								if (!Component) {
									return null;
								}
								return <Component option={chartOption()!} />;
							})()}
						</div>
					</Show>
				</section>
			</Show>

			<Show when={isModalOpen()}>
				<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
					<div class="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
						<header class="mb-4 flex items-start justify-between">
							<div>
								<h2 class="text-lg font-semibold">
									Select {selectedLevelLabel()}
								</h2>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Update the chart by choosing a{" "}
									{selectedLevelLabel().toLowerCase()}.
								</p>
							</div>
							<button
								type="button"
								class="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
								onClick={() => setIsModalOpen(false)}
							>
								Close
							</button>
						</header>

						<Show when={selectedLevel() === REGION_LEVEL_PREFECTURE}>
							<OptionsList
								state={prefectureOptions()}
								onSelect={(value) => {
									setSelectedPrefecture(value);
									setSelectedMunicipality(null);
									setIsModalOpen(false);
								}}
							/>
						</Show>

						<Show when={selectedLevel() === REGION_LEVEL_MUNICIPALITY}>
							<div class="grid gap-4 md:grid-cols-2">
								<div class="flex flex-col gap-2">
									<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
										Prefecture
									</h3>
									<OptionsList
										state={prefectureOptions()}
										selectedValue={selectedPrefecture()}
										onSelect={(value) => {
											setSelectedPrefecture(value);
											setSelectedMunicipality(null);
										}}
									/>
								</div>

								<div class="flex flex-col gap-2">
									<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
										Municipality
									</h3>
									<OptionsList
										state={municipalityOptions()}
										selectedValue={selectedMunicipality()}
										onSelect={(value) => {
											setSelectedMunicipality(value);
											setIsModalOpen(false);
										}}
									/>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</Show>
		</div>
	);
}

type OptionsListProps = {
	state: OptionsState;
	onSelect: (value: string) => void;
	selectedValue?: string | null;
};

/**
 * List of selectable options with loading and error affordances.
 */
function OptionsList(props: OptionsListProps) {
	const isLoading = () => props.state.loading;
	const hasError = () => props.state.error !== null;
	const hasItems = () => props.state.items.length > 0;

	return (
		<div class="flex min-h-56 flex-col gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
			<Show when={isLoading()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">Loading options…</p>
			</Show>

			<Show when={!isLoading() && hasError()}>
				<p class="text-sm text-red-600 dark:text-red-300">
					{props.state.error}
				</p>
			</Show>

			<Show when={!isLoading() && !hasError() && !hasItems()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					No entries available.
				</p>
			</Show>

			<Show when={!isLoading() && !hasError() && hasItems()}>
				<ul class="flex max-h-64 flex-col gap-2 overflow-y-auto">
					<For each={props.state.items}>
						{(item) => {
							const isActive = () => props.selectedValue === item;
							return (
								<li>
									<button
										type="button"
										class={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
											isActive()
												? "bg-blue-600 text-white shadow"
												: "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
										}`}
										onClick={() => props.onSelect(item)}
									>
										{item}
									</button>
								</li>
							);
						}}
					</For>
				</ul>
			</Show>
		</div>
	);
}
