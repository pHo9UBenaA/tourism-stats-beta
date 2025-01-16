import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { InboundTourismData } from 'app/types/inbound-tourism-stats';

const dirPath = 'app/data/jnto';

const fetchInboundByRegionData = async (): Promise<InboundTourismData[]> => {
	const allData: InboundTourismData[] = [];

	const filePath = join(process.cwd(), dirPath, 'jnto.json');
	const jsonData = await readFile(filePath, 'utf-8');
	const yearData: InboundTourismData[] = JSON.parse(jsonData);
	allData.push(...yearData);

	return allData;
};

const fetchInboundByCountryData = async (): Promise<InboundTourismData[]> => {
	const allData: InboundTourismData[] = [];

	const filePath = join(process.cwd(), dirPath, 'jnto-detail.json');
	const jsonData = await readFile(filePath, 'utf-8');
	const yearData: InboundTourismData[] = JSON.parse(jsonData);
	allData.push(...yearData);

	return allData;
};

export { fetchInboundByRegionData, fetchInboundByCountryData };
