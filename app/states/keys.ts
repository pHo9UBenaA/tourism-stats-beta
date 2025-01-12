import { TabType } from "app/types/digital-tourism-stats";

export const AtomKeys = {
	selectedRegions: {
		prefecture: 'selectedRegions:prefecture',
		municipality: 'selectedRegions:municipality',
	},
} as const satisfies {
	selectedRegions: { [key in TabType]: `selectedRegions:${TabType}` };
};

