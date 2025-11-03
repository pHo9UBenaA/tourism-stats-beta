/**
 * @file Region level discriminators for domestic tourism datasets.
 */
export const REGION_LEVEL_PREFECTURE = "prefecture" as const;
export const REGION_LEVEL_MUNICIPALITY = "municipality" as const;

type RegionLevelPrefecture = typeof REGION_LEVEL_PREFECTURE;
type RegionLevelMunicipality = typeof REGION_LEVEL_MUNICIPALITY;

export type RegionLevel = RegionLevelPrefecture | RegionLevelMunicipality;
