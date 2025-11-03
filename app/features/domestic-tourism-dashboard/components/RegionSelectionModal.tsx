/**
 * @file Region selection modal for the domestic tourism dashboard.
 */
import { Show, type Accessor } from "solid-js";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	type RegionLevel,
} from "../../../../src/types/domestic-tourism";
import type { OptionsState } from "../state/types";
import { PrefectureSelectionPanel } from "./PrefectureSelectionPanel";
import { MunicipalitySelectionPanel } from "./MunicipalitySelectionPanel";
import { RegionSelectionModalHeader } from "./RegionSelectionModalHeader";

type RegionSelectionModalProps = {
	readonly selectedLevel: Accessor<RegionLevel>;
	readonly selectedLevelLabel: Accessor<string>;
	readonly prefectureOptions: Accessor<OptionsState>;
	readonly municipalityOptions: Accessor<OptionsState>;
	readonly selectedPrefectures: Accessor<string[]>;
	readonly focusedPrefecture: Accessor<string | null>;
	readonly selectedMunicipalities: Accessor<string[]>;
	readonly onSelectPrefecture: (value: string) => void;
	readonly onSelectMunicipality: (value: string) => void;
	readonly onClose: () => void;
};

function buildDescription(label: string) {
	return `Update the chart by choosing a ${label.toLowerCase()}.`;
}

/**
 * Render region lists inside a modal overlay.
 */
export function RegionSelectionModal(props: RegionSelectionModalProps) {
	const heading = () => `Select ${props.selectedLevelLabel()}`;
	const description = () => buildDescription(props.selectedLevelLabel());

	return (
		<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
			<div class="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
				<RegionSelectionModalHeader
					heading={heading()}
					description={description()}
					onClose={props.onClose}
				/>

				<Show when={props.selectedLevel() === REGION_LEVEL_PREFECTURE}>
					<PrefectureSelectionPanel
						options={props.prefectureOptions()}
						selectedPrefectures={props.selectedPrefectures()}
						onSelect={props.onSelectPrefecture}
					/>
				</Show>

				<Show when={props.selectedLevel() === REGION_LEVEL_MUNICIPALITY}>
					<MunicipalitySelectionPanel
						prefectureOptions={props.prefectureOptions()}
						municipalityOptions={props.municipalityOptions()}
						focusedPrefecture={props.focusedPrefecture()}
						selectedMunicipalities={props.selectedMunicipalities()}
						onSelectPrefecture={props.onSelectPrefecture}
						onSelectMunicipality={props.onSelectMunicipality}
					/>
				</Show>
			</div>
		</div>
	);
}
