/**
 * @file Domestic tourism dashboard feature entry point.
 */
import { Show, createMemo } from "solid-js";

import { ChartSection } from "./ChartSection";
import { RegionSelectionControls } from "./RegionSelectionControls";
import { RegionSelectionModal } from "./RegionSelectionModal";
import { createDatabaseState } from "../state/databaseLifecycle";
import { createChartState } from "../state/chartState";
import { createSelectionState } from "../state/selectionState";

const HEADING_TITLE = "Domestic Tourism Information";
const HEADING_DESCRIPTION =
	"Interactively explore monthly population indicators from the domestic tourism dataset.";
const DATABASE_LOADING_MESSAGE =
	"Initialising DuckDB and loading JSON datasets…";

/**
 * Compose UI for exploring domestic tourism metrics.
 */
export function DomesticTourismDashboard() {
	const database = createDatabaseState();
	const databaseState = () => database.state();
	const databaseInstance = createMemo(() => {
		const current = databaseState();
		return current.kind === "ready" ? current.database : null;
	});
	const chartComponent = createMemo(() => {
		const current = databaseState();
		return current.kind === "ready" ? current.chartComponent : null;
	});
	const databaseError = () => {
		const current = databaseState();
		return current.kind === "error" ? current.message : null;
	};
	const isDatabaseLoading = () => databaseState().kind === "loading";
	const hasDatabase = () => databaseState().kind === "ready";

	const selection = createSelectionState({ database: databaseInstance });
	const chart = createChartState({
		database: databaseInstance,
		selections: selection.selections,
		selectionSummary: selection.summaryLabel,
	});

	const isModalOpen = () => selection.modalState().kind === "open";

	return (
		<div class="flex flex-col gap-6">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">{HEADING_TITLE}</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{HEADING_DESCRIPTION}
				</p>
			</header>

			<Show when={isDatabaseLoading()}>
				<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
					{DATABASE_LOADING_MESSAGE}
				</div>
			</Show>

			<Show when={!isDatabaseLoading() && databaseError()}>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
					{databaseError()}
				</div>
			</Show>

			<Show when={!isDatabaseLoading() && hasDatabase()}>
				<section class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
					<RegionSelectionControls
						selectedLevel={selection.level}
						onSelectPrefecture={selection.selectPrefectureLevel}
						onSelectMunicipality={selection.selectMunicipalityLevel}
						onOpenModal={selection.openModal}
						currentLabel={selection.currentLabel}
					/>

					<ChartSection
						chartState={chart.state}
						chartOption={chart.option}
						chartComponent={chartComponent}
					/>
				</section>
			</Show>

			<Show when={isModalOpen()}>
				<RegionSelectionModal
					selectedLevel={selection.level}
					selectedLevelLabel={selection.levelLabel}
					prefectureOptions={selection.prefectureOptions}
					municipalityOptions={selection.municipalityOptions}
					selectedPrefectures={selection.selectedPrefectures}
					focusedPrefecture={selection.focusedPrefecture}
					selectedMunicipalities={selection.selectedMunicipalitiesForFocus}
					onSelectPrefecture={selection.handlePrefectureSelect}
					onSelectMunicipality={selection.handleMunicipalitySelect}
					onClose={selection.closeModal}
				/>
			</Show>
		</div>
	);
}
