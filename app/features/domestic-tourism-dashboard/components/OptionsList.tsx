/**
 * @file Option picker with loading and error affordances.
 */
import { For, Show } from "solid-js";

import type { OptionsState } from "../state/types";

type OptionsListProps = {
	state: OptionsState;
	onSelect: (value: string) => void;
	selectedValue?: string | null;
	selectedValues?: string[];
};

const OPTION_LOADING_TEXT = "Loading options…";
const OPTION_EMPTY_TEXT = "No entries available.";

/**
 * Render a selectable list of region names.
 */
export function OptionsList(props: OptionsListProps) {
	const isLoading = () => props.state.kind === "loading";
	const errorMessage = () =>
		props.state.kind === "error" ? props.state.message : null;
	const items = () => (props.state.kind === "ready" ? props.state.items : []);
	const hasItems = () => items().length > 0;
	const isIdle = () => props.state.kind === "idle";

	const isActiveValue = (value: string) => {
		if (props.selectedValues && props.selectedValues.includes(value)) {
			return true;
		}

		if (props.selectedValue !== undefined && props.selectedValue !== null) {
			return props.selectedValue === value;
		}

		return false;
	};

	return (
		<div class="flex min-h-56 flex-col gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
			<Show when={isLoading()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{OPTION_LOADING_TEXT}
				</p>
			</Show>

			<Show when={!isLoading() && errorMessage()}>
				<p class="text-sm text-red-600 dark:text-red-300">{errorMessage()}</p>
			</Show>

			<Show when={!isLoading() && !hasItems() && !errorMessage()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{isIdle() ? OPTION_EMPTY_TEXT : OPTION_EMPTY_TEXT}
				</p>
			</Show>

			<Show when={!isLoading() && !errorMessage() && hasItems()}>
				<ul class="flex max-h-64 flex-col gap-2 overflow-y-auto">
					<For each={items()}>
						{(item) => {
							const active = () => isActiveValue(item);
							return (
								<li>
									<button
										type="button"
										class={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
											active()
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
