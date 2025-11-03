/**
 * @file Domestic tourism dashboard feature entry point.
 */
import { Show } from "solid-js";

import { ChartSection } from "./ChartSection";
import { RegionSelectionControls } from "./RegionSelectionControls";
import { RegionSelectionModal } from "./RegionSelectionModal";
import { createDomesticTourismDashboardState } from "../state/createDashboardState";

const HEADING_TITLE = "Domestic Tourism Information";
const HEADING_DESCRIPTION =
	"Interactively explore monthly population indicators from the domestic tourism dataset.";
const DATABASE_LOADING_MESSAGE =
	"Initialising DuckDB and loading JSON datasets…";

/**
 * Compose UI for exploring domestic tourism metrics.
 */
export function DomesticTourismDashboard() {
	const state = createDomesticTourismDashboardState();
	const databaseState = () => state.database.state();
	const isModalOpen = () => state.selection.modalState().kind === "open";
	const hasDatabase = () => databaseState().kind === "ready";
	const databaseError = () => state.database.errorMessage();
	const isDatabaseLoading = () => state.database.isLoading();
	const chartComponent = () => state.database.chartComponent();

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
						selectedLevel={state.selection.level}
						onSelectPrefecture={state.selection.selectPrefectureLevel}
						onSelectMunicipality={state.selection.selectMunicipalityLevel}
						onOpenModal={state.selection.openModal}
						currentLabel={state.selection.currentLabel}
					/>

					<ChartSection
						chartState={state.chart.state}
						chartOption={state.chart.option}
						chartComponent={chartComponent}
					/>
				</section>
			</Show>

			<Show when={isModalOpen()}>
				<RegionSelectionModal
					selectedLevel={state.selection.level}
					selectedLevelLabel={state.selection.levelLabel}
					prefectureOptions={state.selection.prefectureOptions}
					municipalityOptions={state.selection.municipalityOptions}
					selectedPrefectures={state.selection.selectedPrefectures}
					focusedPrefecture={state.selection.focusedPrefecture}
					selectedMunicipalities={
						state.selection.selectedMunicipalitiesForFocus
					}
					onSelectPrefecture={state.selection.handlePrefectureSelect}
					onSelectMunicipality={state.selection.handleMunicipalitySelect}
					onClose={state.selection.closeModal}
				/>
			</Show>
		</div>
	);
}
