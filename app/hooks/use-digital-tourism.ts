import {
	useSelectedRegionsMunicipality,
	useSelectedRegionsPrefecture,
} from 'app/states/digital-tourism-atom';
import type { TabType } from 'app/types/digital-tourism-stats';

export const useSelectedRegions = (groupBy: TabType) => {
	if (groupBy === 'prefecture') {
		return useSelectedRegionsPrefecture();
	}
	if (groupBy === 'municipality') {
		return useSelectedRegionsMunicipality();
	}
	throw new Error();
};
