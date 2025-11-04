/**
 * @file Selection state management for the domestic tourism dashboard.
 */
import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	describeSelectionList,
	filterSelectionsByLevel,
	listMunicipalTargetsForPrefecture,
	listTargetNamesForLevel,
	toggleSelectionTarget,
	type DomesticTourismSelection,
	type RegionLevel,
} from "../../../types/domestic-tourism";
import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	type Accessor,
} from "solid-js";

import type { TourismDatabase } from "../../../utils/tourism-db";
import { queryTargetOptions } from "../../../utils/tourism-db";
import { runCancellableTask } from "../../../utils/cancellable";
import type { OptionsState } from "./types";

const OPTIONS_IDLE: OptionsState = { kind: "idle" };
const OPTIONS_LOADING: OptionsState = { kind: "loading" };

export type SelectionModalState = { kind: "closed" } | { kind: "open" };

export type SelectionSlice = {
	readonly level: Accessor<RegionLevel>;
	readonly levelLabel: Accessor<string>;
	readonly modalState: Accessor<SelectionModalState>;
	readonly prefectureOptions: Accessor<OptionsState>;
	readonly municipalityOptions: Accessor<OptionsState>;
	readonly focusedPrefecture: Accessor<string | null>;
	readonly selectedPrefectures: Accessor<string[]>;
	readonly selectedMunicipalitiesForFocus: Accessor<string[]>;
	readonly selections: Accessor<DomesticTourismSelection[]>;
	readonly summaryLabel: Accessor<string | null>;
	readonly currentLabel: Accessor<string | null>;
	readonly openModal: () => void;
	readonly closeModal: () => void;
	readonly selectPrefectureLevel: () => void;
	readonly selectMunicipalityLevel: () => void;
	readonly handlePrefectureSelect: (value: string) => void;
	readonly handleMunicipalitySelect: (value: string) => void;
};

type CreateSelectionStateArgs = {
	readonly database: Accessor<TourismDatabase | null>;
};

const MUNICIPALITY_LABEL = "By Municipality";
const PREFECTURE_LABEL = "By Prefecture";

function createOptionsReady(items: string[]): OptionsState {
	return { kind: "ready", items };
}

function createOptionsError(message: string): OptionsState {
	return { kind: "error", message };
}

function nextFocusedPrefecture(
	current: string | null,
	options: string[],
): string | null {
	if (current && options.includes(current)) {
		return current;
	}

	return options.at(0) ?? null;
}

/**
 * Compose selection state including options loading and modal toggling.
 */
export function createSelectionState({
	database,
}: CreateSelectionStateArgs): SelectionSlice {
	const [level, setLevel] = createSignal<RegionLevel>(REGION_LEVEL_PREFECTURE);
	const [modalState, setModalState] = createSignal<SelectionModalState>({
		kind: "closed",
	});
	const [prefectureOptions, setPrefectureOptions] =
		createSignal<OptionsState>(OPTIONS_LOADING);
	const [municipalityOptions, setMunicipalityOptions] =
		createSignal<OptionsState>(OPTIONS_IDLE);
	const [focusedPrefecture, setFocusedPrefecture] = createSignal<string | null>(
		null,
	);
	const [selectedTargets, setSelectedTargets] = createSignal<
		DomesticTourismSelection[]
	>([]);

	createEffect(() => {
		const db = database();
		if (!db) {
			setPrefectureOptions(OPTIONS_LOADING);
			return;
		}

		setPrefectureOptions(OPTIONS_LOADING);
		runCancellableTask(onCleanup, async (signal) => {
			const result = await queryTargetOptions(db.db, {
				level: REGION_LEVEL_PREFECTURE,
			});
			if (signal.aborted) {
				return;
			}

			if (result.ok) {
				setPrefectureOptions(createOptionsReady(result.data));
				setFocusedPrefecture((current) =>
					nextFocusedPrefecture(current, result.data),
				);
			} else {
				setPrefectureOptions(createOptionsError(result.error));
			}
		});
	});

	createEffect(() => {
		const db = database();
		const selectedLevel = level();
		const prefecture = focusedPrefecture();
		if (!db || selectedLevel !== REGION_LEVEL_MUNICIPALITY) {
			setMunicipalityOptions(OPTIONS_IDLE);
			return;
		}
		if (!prefecture) {
			setMunicipalityOptions(createOptionsReady([]));
			return;
		}

		setMunicipalityOptions(OPTIONS_LOADING);
		runCancellableTask(onCleanup, async (signal) => {
			const result = await queryTargetOptions(db.db, {
				level: REGION_LEVEL_MUNICIPALITY,
				prefectureName: prefecture,
			});
			if (signal.aborted) {
				return;
			}

			if (result.ok) {
				setMunicipalityOptions(createOptionsReady(result.data));
			} else {
				setMunicipalityOptions(createOptionsError(result.error));
			}
		});
	});

	const selections = createMemo(() => {
		const currentLevel = level();
		return filterSelectionsByLevel(selectedTargets(), currentLevel);
	});

	const selectedPrefectures = createMemo(() =>
		listTargetNamesForLevel(selectedTargets(), REGION_LEVEL_PREFECTURE),
	);

	const selectedMunicipalitiesForFocus = createMemo(() => {
		const prefecture = focusedPrefecture();
		if (!prefecture) {
			return [];
		}

		return listMunicipalTargetsForPrefecture(selectedTargets(), prefecture);
	});

	const summaryLabel = createMemo(() => describeSelectionList(selections()));

	const currentLabel = createMemo(() => {
		const summary = summaryLabel();
		return summary && summary.length > 0 ? summary : null;
	});

	const levelLabel = createMemo(() =>
		level() === REGION_LEVEL_PREFECTURE ? PREFECTURE_LABEL : MUNICIPALITY_LABEL,
	);

	const openModal = () => setModalState({ kind: "open" });
	const closeModal = () => setModalState({ kind: "closed" });

	const handlePrefectureSelect = (value: string) => {
		if (level() === REGION_LEVEL_PREFECTURE) {
			setSelectedTargets((current) =>
				toggleSelectionTarget(current, {
					level: REGION_LEVEL_PREFECTURE,
					targetName: value,
				}),
			);
		}

		setFocusedPrefecture(value);
	};

	const handleMunicipalitySelect = (value: string) => {
		const prefecture = focusedPrefecture();
		if (!prefecture) {
			return;
		}

		setSelectedTargets((current) =>
			toggleSelectionTarget(current, {
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: value,
				prefectureName: prefecture,
			}),
		);
	};

	const selectPrefectureLevel = () => {
		setLevel(REGION_LEVEL_PREFECTURE);
		setMunicipalityOptions(OPTIONS_IDLE);
	};

	const selectMunicipalityLevel = () => {
		setLevel(REGION_LEVEL_MUNICIPALITY);
	};

	return {
		level,
		levelLabel,
		modalState,
		prefectureOptions,
		municipalityOptions,
		focusedPrefecture,
		selectedPrefectures,
		selectedMunicipalitiesForFocus,
		selections,
		summaryLabel,
		currentLabel,
		openModal,
		closeModal,
		selectPrefectureLevel,
		selectMunicipalityLevel,
		handlePrefectureSelect,
		handleMunicipalitySelect,
	};
}
