/**
 * @file Pure helpers for handling multi-select region targets.
 */
import type { DomesticTourismSelection } from "./selection";
import { REGION_LEVEL_PREFECTURE } from "./region";

type ToggleSelectionArgs = {
	current: DomesticTourismSelection[];
	next: DomesticTourismSelection;
};

function isSameSelection(
	left: DomesticTourismSelection,
	right: DomesticTourismSelection,
) {
	if (left.level !== right.level) {
		return false;
	}

	if (left.level === REGION_LEVEL_PREFECTURE) {
		return left.targetName === right.targetName;
	}

	return (
		left.targetName === right.targetName &&
		left.prefectureName === right.prefectureName
	);
}

/**
 * Toggle a region target within a selection list.
 */
export function toggleSelectionTarget(
	current: ToggleSelectionArgs["current"],
	next: ToggleSelectionArgs["next"],
): DomesticTourismSelection[] {
	return current.some((entry) => isSameSelection(entry, next))
		? current.filter((entry) => !isSameSelection(entry, next))
		: [...current, next];
}

function formatSelection(entry: DomesticTourismSelection) {
	if (entry.level === REGION_LEVEL_PREFECTURE) {
		return entry.targetName;
	}

	return `${entry.prefectureName} / ${entry.targetName}`;
}

/**
 * Humanise a selection list for showing a summary label.
 */
export function describeSelectionList(
	selections: DomesticTourismSelection[],
): string | null {
	if (selections.length === 0) {
		return null;
	}

	return selections.map(formatSelection).join(", ");
}
