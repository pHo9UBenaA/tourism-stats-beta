/**
 * @file Municipality-focused selection panel for the region modal.
 */
import type { OptionsState } from "../state/types";
import { OptionsList } from "./OptionsList";

type MunicipalitySelectionPanelProps = {
	readonly prefectureOptions: OptionsState;
	readonly municipalityOptions: OptionsState;
	readonly focusedPrefecture: string | null;
	readonly selectedMunicipalities: string[];
	readonly onSelectPrefecture: (value: string) => void;
	readonly onSelectMunicipality: (value: string) => void;
};

const PREFECTURE_HEADING = "Prefecture";
const MUNICIPALITY_HEADING = "Municipality";

/**
 * Render prefecture focus and scoped municipality selectors.
 */
export function MunicipalitySelectionPanel(
	props: MunicipalitySelectionPanelProps,
) {
	return (
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
					{PREFECTURE_HEADING}
				</h3>
				<OptionsList
					state={props.prefectureOptions}
					onSelect={props.onSelectPrefecture}
					selectedValue={props.focusedPrefecture}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
					{MUNICIPALITY_HEADING}
				</h3>
				<OptionsList
					state={props.municipalityOptions}
					onSelect={props.onSelectMunicipality}
					selectedValues={props.selectedMunicipalities}
				/>
			</div>
		</div>
	);
}
