import { describe, expect, it } from "vitest";

import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	createTourismPeriod,
	describeSelectionList,
	filterSelectionsByLevel,
	formatTourismPeriod,
	deriveChartPeriodLabels,
	createTourismDatasetRegistrations,
	listMunicipalTargetsForPrefecture,
	listTargetNamesForLevel,
	mapRowsToChartSeries,
	toggleSelectionTarget,
} from "../src/types/domestic-tourism";

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
					period: createTourismPeriod(2023, 2),
					targetName: "北海道",
					population: 10,
				},
				{
					period: createTourismPeriod(2023, 1),
					targetName: "北海道",
					population: 5,
				},
			],
			targetLabel: "北海道",
		});

		expect(series.label).toBe("北海道");
		expect(
			series.points.map((point) => ({
				period: formatTourismPeriod(point.period),
				population: point.population,
			})),
		).toEqual([
			{ period: "2023-01", population: 5 },
			{ period: "2023-02", population: 10 },
		]);
	});
});

describe("deriveChartPeriodLabels", () => {
	it("merges and orders periods across multiple series", () => {
		const labels = deriveChartPeriodLabels([
			{
				label: "Prefecture",
				points: [
					{
						period: createTourismPeriod(2023, 2),
						population: 5,
					},
					{
						period: createTourismPeriod(2023, 3),
						population: 6,
					},
				],
			},
			{
				label: "Municipality",
				points: [
					{
						period: createTourismPeriod(2023, 1),
						population: 2,
					},
					{
						period: createTourismPeriod(2023, 3),
						population: 4,
					},
				],
			},
		]);

		expect(labels).toEqual(["2023-01", "2023-02", "2023-03"]);
	});
});

describe("createTourismDatasetRegistrations", () => {
	it("returns dataset metadata for each year and region level", () => {
		const registrations = createTourismDatasetRegistrations();
		const prefectureEntries = registrations.filter(
			(entry) => entry.level === REGION_LEVEL_PREFECTURE,
		);
		const municipalityEntries = registrations.filter(
			(entry) => entry.level === REGION_LEVEL_MUNICIPALITY,
		);

		expect(registrations).toHaveLength(6);
		expect(prefectureEntries).toHaveLength(3);
		expect(municipalityEntries).toHaveLength(3);
		expect(prefectureEntries[0]).toMatchObject({
			path: expect.stringContaining("/data/digital/pref2021.json"),
		});
	});
});

describe("toggleSelectionTarget", () => {
	it("adds a new prefecture selection when it does not exist", () => {
		const current = [];
		const updated = toggleSelectionTarget(current, {
			level: REGION_LEVEL_PREFECTURE,
			targetName: "北海道",
		});

		expect(updated).toEqual([
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
		]);
	});

	it("removes an existing municipality selection when toggled again", () => {
		const current = [
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "札幌市中央区",
				prefectureName: "北海道",
			},
		];
		const updated = toggleSelectionTarget(current, {
			level: REGION_LEVEL_MUNICIPALITY,
			targetName: "札幌市中央区",
			prefectureName: "北海道",
		});

		expect(updated).toEqual([]);
	});

	it("preserves other selections when toggling a single entry", () => {
		const current = [
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "青森県",
			},
		];
		const updated = toggleSelectionTarget(current, {
			level: REGION_LEVEL_PREFECTURE,
			targetName: "北海道",
		});

		expect(updated).toEqual([
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "青森県",
			},
		]);
	});
});

describe("describeSelectionList", () => {
	it("returns null when no selections exist", () => {
		const label = describeSelectionList([]);
		expect(label).toBeNull();
	});

	it("formats prefecture selections joined by comma", () => {
		const label = describeSelectionList([
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "青森県",
			},
		]);

		expect(label).toBe("北海道, 青森県");
	});

	it("formats municipality selections with prefecture context", () => {
		const label = describeSelectionList([
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "札幌市中央区",
				prefectureName: "北海道",
			},
		]);

		expect(label).toBe("北海道 / 札幌市中央区");
	});
});

describe("selection domain helpers", () => {
	it("filters selections by level", () => {
		const entries = [
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "札幌市中央区",
				prefectureName: "北海道",
			},
		];

		const filtered = filterSelectionsByLevel(entries, REGION_LEVEL_PREFECTURE);
		expect(filtered).toEqual([
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
		]);
	});

	it("lists target names for the provided level", () => {
		const entries = [
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "青森県",
			},
		];

		expect(listTargetNamesForLevel(entries, REGION_LEVEL_PREFECTURE)).toEqual([
			"北海道",
			"青森県",
		]);
	});

	it("lists municipalities scoped by the focused prefecture", () => {
		const entries = [
			{
				level: REGION_LEVEL_PREFECTURE,
				targetName: "北海道",
			},
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "札幌市中央区",
				prefectureName: "北海道",
			},
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "函館市",
				prefectureName: "北海道",
			},
			{
				level: REGION_LEVEL_MUNICIPALITY,
				targetName: "青森市",
				prefectureName: "青森県",
			},
		];

		expect(listMunicipalTargetsForPrefecture(entries, "北海道")).toEqual([
			"札幌市中央区",
			"函館市",
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
