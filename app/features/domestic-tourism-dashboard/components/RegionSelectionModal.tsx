/**
 * @file Region selection modal for the domestic tourism dashboard.
 */
import { Show, type Accessor } from "solid-js";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	type RegionLevel,
} from "../types";
import type { OptionsState } from "../state/types";
import { OptionsList } from "./OptionsList";

type RegionSelectionModalProps = {
	selectedLevel: Accessor<RegionLevel>;
	selectedLevelLabel: Accessor<string>;
	prefectureOptions: Accessor<OptionsState>;
	municipalityOptions: Accessor<OptionsState>;
	selectedPrefecture: Accessor<string | null>;
	selectedMunicipality: Accessor<string | null>;
	onSelectPrefecture: (value: string) => void;
	onSelectMunicipality: (value: string) => void;
	onClose: () => void;
};

const CLOSE_LABEL = "Close";
const PREFECTURE_HEADING = "Prefecture";
const MUNICIPALITY_HEADING = "Municipality";

/**
 * Render region lists inside a modal overlay.
 */
export function RegionSelectionModal(props: RegionSelectionModalProps) {
	return (
		<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
			<div class="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
				<header class="mb-4 flex items-start justify-between">
					<div>
						<h2 class="text-lg font-semibold">
							Select {props.selectedLevelLabel()}
						</h2>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Update the chart by choosing a{" "}
							{props.selectedLevelLabel().toLowerCase()}.
						</p>
					</div>
					<button
						type="button"
						class="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
						onClick={props.onClose}
					>
						{CLOSE_LABEL}
					</button>
				</header>

				<Show when={props.selectedLevel() === REGION_LEVEL_PREFECTURE}>
					<OptionsList
						state={props.prefectureOptions()}
						onSelect={props.onSelectPrefecture}
					/>
				</Show>

				<Show when={props.selectedLevel() === REGION_LEVEL_MUNICIPALITY}>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="flex flex-col gap-2">
							<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
								{PREFECTURE_HEADING}
							</h3>
							<OptionsList
								state={props.prefectureOptions()}
								selectedValue={props.selectedPrefecture()}
								onSelect={props.onSelectPrefecture}
							/>
						</div>

						<div class="flex flex-col gap-2">
							<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300">
								{MUNICIPALITY_HEADING}
							</h3>
							<OptionsList
								state={props.municipalityOptions()}
								selectedValue={props.selectedMunicipality()}
								onSelect={props.onSelectMunicipality}
							/>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
}
