// TODO
import { DEFAULT_REGIONS, Indexes } from 'app/constants/digital-tourism-stats';
import { useAtom } from 'jotai/react';
import { atomWithStorage } from 'jotai/utils';
import { AtomKeys } from './keys';

const selectedRegionsPrefectureAtom = atomWithStorage<
	// (typeof UNIQUE_REGIONS)['prefecture'][number][]
	string[]
>(
	AtomKeys.selectedRegions[Indexes.prefecture],
	DEFAULT_REGIONS[Indexes.prefecture],
	undefined,
	// {
	// 	getOnInit: true,
	// },
);

export const useSelectedRegionsPrefecture = () =>
	useAtom(selectedRegionsPrefectureAtom);

const selectedRegionsMunicipalityAtom = atomWithStorage<
	// (typeof UNIQUE_REGIONS)['municipality'][number][]
	string[]
>(
	AtomKeys.selectedRegions[Indexes.municipality],
	DEFAULT_REGIONS[Indexes.municipality],
	undefined,
	// {
	// 	getOnInit: true,
	// },
);

export const useSelectedRegionsMunicipality = () =>
	useAtom(selectedRegionsMunicipalityAtom);
