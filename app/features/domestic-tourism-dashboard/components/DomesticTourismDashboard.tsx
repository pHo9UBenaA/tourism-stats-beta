/**
 * @file Domestic tourism dashboard feature entry point.
 */
import { Show } from "solid-js";

import { REGION_LEVEL_PREFECTURE } from "../types";
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

	const handlePrefectureSelect = (value: string) => {
		if (state.selectedLevel() === REGION_LEVEL_PREFECTURE) {
			state.togglePrefectureSelection(value);
			state.focusPrefecture(value);
			return;
		}

		state.focusPrefecture(value);
	};

	const handleMunicipalitySelect = (value: string) => {
		state.toggleMunicipalitySelection(value);
	};

	return (
		<div class="flex flex-col gap-6">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">{HEADING_TITLE}</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{HEADING_DESCRIPTION}
				</p>
			</header>

			<Show when={state.isDatabaseLoading()}>
				<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
					{DATABASE_LOADING_MESSAGE}
				</div>
			</Show>

			<Show when={!state.isDatabaseLoading() && state.databaseError()}>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
					{state.databaseError()}
				</div>
			</Show>

			<Show when={!state.isDatabaseLoading() && !state.databaseError()}>
				<section class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
					<RegionSelectionControls
						selectedLevel={state.selectedLevel}
						onSelectPrefecture={state.selectPrefectureLevel}
						onSelectMunicipality={state.selectMunicipalityLevel}
						onOpenModal={state.openModal}
						currentLabel={state.currentTargetLabel}
					/>

					<ChartSection
						chartState={state.chartState}
						chartOption={state.chartOption}
						chartComponent={state.chartComponent}
					/>
				</section>
			</Show>

			<Show when={state.isModalOpen()}>
				<RegionSelectionModal
					selectedLevel={state.selectedLevel}
					selectedLevelLabel={state.selectedLevelLabel}
					prefectureOptions={state.prefectureOptions}
					municipalityOptions={state.municipalityOptions}
					selectedPrefectures={state.selectedPrefectures}
					focusedPrefecture={state.focusedPrefecture}
					selectedMunicipalities={state.selectedMunicipalitiesForFocus}
					onSelectPrefecture={handlePrefectureSelect}
					onSelectMunicipality={handleMunicipalitySelect}
					onClose={state.closeModal}
				/>
			</Show>
		</div>
	);
}
