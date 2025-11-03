/**
 * @file Aggregated exports for domestic tourism domain models.
 */
export {
	REGION_LEVEL_PREFECTURE,
	REGION_LEVEL_MUNICIPALITY,
	type RegionLevel,
	type DomesticTourismSelection,
	type TargetOptionsArgs,
	type DomesticTourismRow,
	type DomesticTourismSeries,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	mapRowsToChartSeries,
	toggleSelectionTarget,
	describeSelectionList,
} from "../../app/features/domestic-tourism-dashboard/types";
