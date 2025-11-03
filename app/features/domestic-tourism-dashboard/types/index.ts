/**
 * @file Public surface for domestic tourism dashboard domain types.
 */
export {
	REGION_LEVEL_PREFECTURE,
	REGION_LEVEL_MUNICIPALITY,
	type RegionLevel,
} from "./region";

export {
	type DomesticTourismSelection,
	type TargetOptionsArgs,
} from "./selection";

export { toggleSelectionTarget, describeSelectionList } from "./selectionList";

export {
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
} from "./queries";

export {
	type DomesticTourismRow,
	type DomesticTourismSeries,
	mapRowsToChartSeries,
} from "./series";
