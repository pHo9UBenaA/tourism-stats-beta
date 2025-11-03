/**
 * @file Prefecture-focused selection panel for the region modal.
 */
import type { OptionsState } from "../state/types";
import { OptionsList } from "./OptionsList";

type PrefectureSelectionPanelProps = {
	readonly options: OptionsState;
	readonly selectedPrefectures: string[];
	readonly onSelect: (value: string) => void;
};

/**
 * Render prefecture options with multi-select affordance.
 */
export function PrefectureSelectionPanel(props: PrefectureSelectionPanelProps) {
	return (
		<OptionsList
			state={props.options}
			onSelect={props.onSelect}
			selectedValues={props.selectedPrefectures}
		/>
	);
}
