/**
 * @file Pure chart option assembly for the domestic tourism dashboard.
 */
import type { EChartsOption } from "echarts";

import {
	deriveChartPeriodLabels,
	formatTourismPeriod,
	resolveTourismChartTitle,
	type DomesticTourismSeries,
} from "../../../../src/types/domestic-tourism";
const CHART_GRID_PADDING = {
	left: 48,
	right: 16,
	top: 72,
	bottom: 56,
} as const;
const AXIS_LABEL_ROTATION_DEGREES = 35;
const SERIES_TYPE_LINE = "line";
const TOOLTIP_TRIGGER_AXIS = "axis";
const Y_AXIS_LABEL = "Population";

type ChartOptionArgs = {
	readonly series: DomesticTourismSeries[];
	readonly title: string;
};

function buildSeriesData(
	periods: string[],
	series: DomesticTourismSeries,
): (number | null)[] {
	const pointIndex = new Map(
		series.points.map((point) => [
			formatTourismPeriod(point.period),
			point.population,
		]),
	);
	return periods.map((period) => pointIndex.get(period) ?? null);
}

function assembleOption({ series, title }: ChartOptionArgs): EChartsOption {
	const periods = deriveChartPeriodLabels(series);
	const shouldFillArea = series.length === 1;

	return {
		title: {
			text: title,
			left: "center",
		},
		tooltip: {
			trigger: TOOLTIP_TRIGGER_AXIS,
		},
		grid: { ...CHART_GRID_PADDING },
		xAxis: {
			type: "category",
			data: periods,
			axisLabel: {
				rotate: AXIS_LABEL_ROTATION_DEGREES,
			},
		},
		yAxis: {
			type: "value",
			name: Y_AXIS_LABEL,
		},
		series: series.map((entry) => ({
			name: entry.label,
			type: SERIES_TYPE_LINE,
			smooth: true,
			data: buildSeriesData(periods, entry),
			...(shouldFillArea ? { areaStyle: {} } : {}),
		})),
	};
}

type BuildTourismChartOptionArgs = {
	readonly series: DomesticTourismSeries[];
	readonly summary: string | null;
};

/**
 * Assemble an ECharts option for the provided tourism series.
 */
export function buildTourismChartOption({
	series,
	summary,
}: BuildTourismChartOptionArgs): EChartsOption {
	return assembleOption({
		series,
		title: resolveTourismChartTitle({
			series,
			summary,
		}),
	});
}
