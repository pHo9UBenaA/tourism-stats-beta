interface InboundTourismData {
	year: number;
	month: number;
	countryName: string;
	population: number;
}

type TabType = 'region' | 'country';

export type { InboundTourismData, TabType };
