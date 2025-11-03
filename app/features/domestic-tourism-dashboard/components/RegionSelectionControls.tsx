/**
 * @file Region selection controls for the domestic tourism dashboard.
 */
import type { Accessor } from "solid-js";
import { Show } from "solid-js";

import type { RegionLevel } from "../../../../src/types/domestic-tourism";
import { RegionLevelToggle } from "./RegionLevelToggle";

type RegionSelectionControlsProps = {
	selectedLevel: Accessor<RegionLevel>;
	onSelectPrefecture: () => void;
	onSelectMunicipality: () => void;
	onOpenModal: () => void;
	currentLabel: Accessor<string | null>;
};

const BUTTON_LABEL_SELECT_REGION = "Select Region";
const SELECTED_PREFIX = "Selected: ";

/**
 * Render toggle and modal launcher for region picking.
 */
export function RegionSelectionControls(props: RegionSelectionControlsProps) {
	return (
		<div class="flex flex-wrap items-center gap-3">
			<RegionLevelToggle
				selectedLevel={props.selectedLevel}
				onSelectPrefecture={props.onSelectPrefecture}
				onSelectMunicipality={props.onSelectMunicipality}
			/>

			<button
				type="button"
				class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
				onClick={props.onOpenModal}
			>
				{BUTTON_LABEL_SELECT_REGION}
			</button>

			<Show when={props.currentLabel()}>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					{SELECTED_PREFIX}
					{props.currentLabel()}
				</span>
			</Show>
		</div>
	);
}
