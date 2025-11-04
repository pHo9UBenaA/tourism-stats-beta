/**
 * @file Shared state primitives for the domestic tourism dashboard feature.
 */
import type { DomesticTourismSeries } from "../../../types/domestic-tourism";

export type OptionsState =
	| { kind: "idle" }
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| { kind: "ready"; items: string[] };

export type ChartState =
	| { kind: "idle" }
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| { kind: "ready"; series: DomesticTourismSeries[] };
