import { describe, expect, it } from "vitest";

import { createTourismPeriod } from "../src/types/domestic-tourism";
import {
	DEFAULT_MULTI_SERIES_TITLE,
	buildTourismChartOption,
} from "../app/features/domestic-tourism-dashboard/state/chartOption";

const SAMPLE_SINGLE_SERIES = [
	{
		label: "Hokkaido",
		points: [
			{
				period: createTourismPeriod(2023, 1),
				population: 5,
			},
			{
				period: createTourismPeriod(2023, 2),
				population: 10,
			},
		],
	},
];

const SAMPLE_MULTI_SERIES = [
	...SAMPLE_SINGLE_SERIES,
	{
		label: "Aichi",
		points: [
			{
				period: createTourismPeriod(2023, 1),
				population: 3,
			},
			{
				period: createTourismPeriod(2023, 2),
				population: 8,
			},
		],
	},
];

describe("buildTourismChartOption", () => {
	it("uses the provided summary as the chart title", () => {
		const option = buildTourismChartOption({
			series: SAMPLE_SINGLE_SERIES,
			summary: "Custom summary",
		});

		expect(option.title?.text).toBe("Custom summary");
		expect(option.series?.[0]?.data).toEqual([5, 10]);
		expect(option.series?.[0]).toMatchObject({
			name: "Hokkaido",
			type: "line",
			smooth: true,
		});
	});

	it("uses the single series label when no summary is provided", () => {
		const option = buildTourismChartOption({
			series: SAMPLE_SINGLE_SERIES,
			summary: null,
		});

		expect(option.title?.text).toBe("Hokkaido");
		expect(option.series?.[0]).toHaveProperty("areaStyle");
		expect(option.xAxis).toMatchObject({ data: ["2023-01", "2023-02"] });
	});

	it("falls back to the default title for multiple series", () => {
		const option = buildTourismChartOption({
			series: SAMPLE_MULTI_SERIES,
			summary: null,
		});

		expect(option.title?.text).toBe(DEFAULT_MULTI_SERIES_TITLE);
		expect(option.series?.[0]).not.toHaveProperty("areaStyle");
		expect(option.series?.[1]?.data).toEqual([3, 8]);
	});
});
