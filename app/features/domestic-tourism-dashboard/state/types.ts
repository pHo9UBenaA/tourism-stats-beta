/**
 * @file Shared state primitives for the domestic tourism dashboard feature.
 */
import type { FetchResult } from "../../../../src/types/fetch";
import type { DomesticTourismSeries } from "../types";

export type OptionsState = {
	loading: boolean;
	error: string | null;
	items: string[];
};

export type ChartState = {
	loading: boolean;
	data: FetchResult<DomesticTourismSeries[], string> | null;
};

export type DashboardSelection = {
	level: string;
	prefecture: string | null;
	municipality: string | null;
};
