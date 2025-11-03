import { describe, expect, it } from "vitest";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	mapRowsToChartSeries,
} from "../app/features/domestic-tourism-dashboard/types";

describe("buildDomesticTourismQuery", () => {
	it("creates a prefecture-level query that aggregates monthly population", () => {
		const query = buildDomesticTourismQuery({
			level: REGION_LEVEL_PREFECTURE,
			targetName: "北海道",
		});

		expect(query).toContain("FROM read_json('/data/digital/pref2021.json')");
		expect(query).toContain("UNION ALL SELECT");
		expect(query).toContain("prefectureName AS prefecture_name");
		expect(query).toContain("WHERE prefecture_name = '北海道'");
		expect(query).toContain("GROUP BY year, month");
		expect(query.trim().startsWith("WITH"));
	});

	it("creates a municipality-level query scoped by prefecture and region", () => {
		const query = buildDomesticTourismQuery({
			level: REGION_LEVEL_MUNICIPALITY,
			targetName: "札幌市中央区",
			prefectureName: "北海道",
		});

		expect(query).toContain("FROM read_json('/data/digital/city2021.json')");
		expect(query).toContain("UNION ALL SELECT");
		expect(query).toContain("regionName AS region_name");
		expect(query).toContain("WHERE prefecture_name = '北海道'");
		expect(query).toContain("AND region_name = '札幌市中央区'");
		expect(query).toContain("GROUP BY year, month");
	});
});

describe("mapRowsToChartSeries", () => {
	it("groups ordered chart points for the selected target", () => {
		const series = mapRowsToChartSeries({
			rows: [
				{
					year: 2023,
					month: 2,
					targetName: "北海道",
					population: 10,
				},
				{
					year: 2023,
					month: 1,
					targetName: "北海道",
					population: 5,
				},
			],
			targetLabel: "北海道",
		});

		expect(series.label).toBe("北海道");
		expect(series.points).toEqual([
			{ period: "2023-01", population: 5 },
			{ period: "2023-02", population: 10 },
		]);
	});
});

describe("buildTargetOptionsQuery", () => {
	it("requests prefecture names ordered alphabetically", () => {
		const query = buildTargetOptionsQuery({
			level: REGION_LEVEL_PREFECTURE,
		});

		expect(query).toContain("SELECT DISTINCT prefecture_name");
		expect(query).toContain("FROM (");
		expect(query).toContain("/data/digital/pref2021.json");
		expect(query).toContain("ORDER BY prefecture_name ASC");
	});

	it("requests municipality names scoped by prefecture", () => {
		const query = buildTargetOptionsQuery({
			level: REGION_LEVEL_MUNICIPALITY,
			prefectureName: "北海道",
		});

		expect(query).toContain("SELECT DISTINCT region_name");
		expect(query).toContain("WHERE prefecture_name = '北海道'");
		expect(query).toContain("/data/digital/city2023.json");
		expect(query).toContain("ORDER BY region_name ASC");
	});
});
