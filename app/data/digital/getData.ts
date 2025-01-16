import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DigitalRegionData } from 'app/types/digital-tourism-stats';

const dirPath = 'app/data/digital';

const years = [2021, 2022, 2023];

const fetchPrefectureData = async (): Promise<DigitalRegionData[]> => {
	const allData: DigitalRegionData[] = [];

	for (const year of years) {
		const filePath = join(process.cwd(), dirPath, `pref${year}.json`);
		const jsonData = await readFile(filePath, 'utf-8');
		const yearData: DigitalRegionData[] = JSON.parse(jsonData);
		allData.push(...yearData);
	}

	return allData;
};

const fetchMunicipalityData = async (): Promise<DigitalRegionData[]> => {
	const allData: DigitalRegionData[] = [];

	for (const year of years) {
		const filePath = join(process.cwd(), dirPath, `city${year}.json`);
		const jsonData = await readFile(filePath, 'utf-8');
		const yearData: DigitalRegionData[] = JSON.parse(jsonData);
		allData.push(...yearData);
	}

	return allData;
};

export { fetchPrefectureData, fetchMunicipalityData };
