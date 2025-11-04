/**
 * @file Level toggle buttons for the domestic tourism dashboard.
 */
import type { Accessor } from "solid-js";

import {
	REGION_LEVEL_PREFECTURE,
	type RegionLevel,
} from "../../../types/domestic-tourism";

type RegionLevelToggleProps = {
	selectedLevel: Accessor<RegionLevel>;
	onSelectPrefecture: () => void;
	onSelectMunicipality: () => void;
};

const BUTTON_CLASS_INACTIVE =
	"border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300";
const BUTTON_CLASS_ACTIVE = "bg-blue-600 text-white shadow";
const BUTTON_LABEL_PREFECTURE = "By Prefecture";
const BUTTON_LABEL_MUNICIPALITY = "By Municipality";

/**
 * Switch between prefecture and municipality aggregations.
 */
export function RegionLevelToggle(props: RegionLevelToggleProps) {
	const isPrefectureLevel = () =>
		props.selectedLevel() === REGION_LEVEL_PREFECTURE;

	return (
		<div class="flex items-center gap-2">
			<button
				type="button"
				class={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
					isPrefectureLevel() ? BUTTON_CLASS_ACTIVE : BUTTON_CLASS_INACTIVE
				}`}
				onClick={props.onSelectPrefecture}
			>
				{BUTTON_LABEL_PREFECTURE}
			</button>

			<button
				type="button"
				class={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
					isPrefectureLevel() ? BUTTON_CLASS_INACTIVE : BUTTON_CLASS_ACTIVE
				}`}
				onClick={props.onSelectMunicipality}
			>
				{BUTTON_LABEL_MUNICIPALITY}
			</button>
		</div>
	);
}
