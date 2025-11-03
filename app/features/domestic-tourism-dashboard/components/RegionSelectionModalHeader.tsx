/**
 * @file Header for the region selection modal.
 */
type RegionSelectionModalHeaderProps = {
	readonly heading: string;
	readonly description: string;
	readonly onClose: () => void;
};

const CLOSE_LABEL = "Close";

/**
 * Present modal title, description, and close affordance.
 */
export function RegionSelectionModalHeader(
	props: RegionSelectionModalHeaderProps,
) {
	return (
		<header class="mb-4 flex items-start justify-between">
			<div>
				<h2 class="text-lg font-semibold">{props.heading}</h2>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{props.description}
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
	);
}
