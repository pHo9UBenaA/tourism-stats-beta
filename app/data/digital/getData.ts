import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type DigitalRegionData = {
	year: number; // 年
	month: number; // 月
	// regionType: string; // 地域タイプ (例: "市区町村") 一旦いらない
	// dataType: string; // データタイプ (例: "観光来訪者数") 一旦いらない
	// prefectureCode: number; // 都道府県コード 一旦いらない
	prefectureName: string; // 都道府県名
	// regionCode: number; // 地域コード 一旦いらない
	regionName?: string; // 地域名
	population: number; // 人口
};

const years = [2021, 2022, 2023];

const fetchPrefectureData = async (): Promise<DigitalRegionData[]> => {
	const allData: DigitalRegionData[] = [];

	for (const year of years) {
		const filePath = join(
			process.cwd(),
			'app/data/digital',
			`pref${year}.json`,
		);
		const jsonData = await readFile(filePath, 'utf-8');
		const yearData: DigitalRegionData[] = JSON.parse(jsonData);
		allData.push(...yearData);
	}

	return allData;
};

const fetchMunicipalityData = async (): Promise<DigitalRegionData[]> => {
	const allData: DigitalRegionData[] = [];

	for (const year of years) {
		const filePath = join(
			process.cwd(),
			'app/data/digital',
			`city${year}.json`,
		);
		const jsonData = await readFile(filePath, 'utf-8');
		const yearData: DigitalRegionData[] = JSON.parse(jsonData);
		allData.push(...yearData);
	}

	return allData;
};

export { fetchPrefectureData, fetchMunicipalityData };
