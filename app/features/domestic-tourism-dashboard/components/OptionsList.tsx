/**
 * @file Option picker with loading and error affordances.
 */
import { For, Show } from "solid-js";

import type { OptionsState } from "../state/types";

type OptionsListProps = {
	state: OptionsState;
	onSelect: (value: string) => void;
	selectedValue?: string | null;
};

const OPTION_LOADING_TEXT = "Loading options…";
const OPTION_EMPTY_TEXT = "No entries available.";

/**
 * Render a selectable list of region names.
 */
export function OptionsList(props: OptionsListProps) {
	const isLoading = () => props.state.loading;
	const hasError = () => props.state.error !== null;
	const hasItems = () => props.state.items.length > 0;

	return (
		<div class="flex min-h-56 flex-col gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
			<Show when={isLoading()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{OPTION_LOADING_TEXT}
				</p>
			</Show>

			<Show when={!isLoading() && hasError()}>
				<p class="text-sm text-red-600 dark:text-red-300">
					{props.state.error}
				</p>
			</Show>

			<Show when={!isLoading() && !hasError() && !hasItems()}>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{OPTION_EMPTY_TEXT}
				</p>
			</Show>

			<Show when={!isLoading() && !hasError() && hasItems()}>
				<ul class="flex max-h-64 flex-col gap-2 overflow-y-auto">
					<For each={props.state.items}>
						{(item) => {
							const isActive = () => props.selectedValue === item;
							return (
								<li>
									<button
										type="button"
										class={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
											isActive()
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
