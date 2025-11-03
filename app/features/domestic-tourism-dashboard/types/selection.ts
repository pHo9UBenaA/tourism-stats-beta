/**
 * @file Selection models for domestic tourism regional aggregation.
 */
import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	type RegionLevel,
} from "./region";

export type PrefectureSelection = {
	level: typeof REGION_LEVEL_PREFECTURE;
	targetName: string;
};

export type MunicipalitySelection = {
	level: typeof REGION_LEVEL_MUNICIPALITY;
	targetName: string;
	prefectureName: string;
};

export type DomesticTourismSelection =
	| PrefectureSelection
	| MunicipalitySelection;

export type PrefectureTargetOptionsArgs = {
	level: typeof REGION_LEVEL_PREFECTURE;
};

export type MunicipalityTargetOptionsArgs = {
	level: typeof REGION_LEVEL_MUNICIPALITY;
	prefectureName: string;
};

export type TargetOptionsArgs =
	| PrefectureTargetOptionsArgs
	| MunicipalityTargetOptionsArgs;

export function isMunicipalityLevel(level: RegionLevel) {
	return level === REGION_LEVEL_MUNICIPALITY;
}
