/**
 * @file Chart data mapping helpers for domestic tourism dashboards.
 */
export type DomesticTourismRow = {
	year: number;
	month: number;
	targetName: string;
	population: number;
};

export type DomesticTourismChartPoint = {
	period: string;
	population: number;
};

export type DomesticTourismSeries = {
	label: string;
	points: DomesticTourismChartPoint[];
};

type MapRowsToSeriesArgs = {
	rows: DomesticTourismRow[];
	targetLabel: string;
};

/**
 * Order raw query rows and shape them for the chart component.
 */
export function mapRowsToChartSeries(
	args: MapRowsToSeriesArgs,
): DomesticTourismSeries {
	const points = [...args.rows]
		.sort((left, right) => {
			if (left.year === right.year) {
				return left.month - right.month;
			}

			return left.year - right.year;
		})
		.map((row) => ({
			period: `${row.year}-${row.month.toString().padStart(2, "0")}`,
			population: row.population,
		}));

	return {
		label: args.targetLabel,
		points,
	};
}
