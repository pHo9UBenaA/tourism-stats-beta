interface DigitalRegionData {
	year: number;
	month: number;
	prefectureName: string;
	regionName?: string;
	population: number;
};

type TabType = 'prefecture' | 'municipality'

export type { DigitalRegionData, TabType };
