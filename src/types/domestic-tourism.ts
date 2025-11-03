/**
 * @file Domain models and pure helpers for domestic tourism analytics.
 * @description Provides algebraic data types and pure functions that describe
 * domestic tourism selections, query builders, and chart mapping logic. These
 * utilities are framework-agnostic to support reuse across application layers
 * and tests.
 */

export const REGION_LEVEL_PREFECTURE = "prefecture" as const;
export const REGION_LEVEL_MUNICIPALITY = "municipality" as const;

export type RegionLevel =
	| typeof REGION_LEVEL_PREFECTURE
	| typeof REGION_LEVEL_MUNICIPALITY;

export type PrefectureSelection = {
	readonly level: typeof REGION_LEVEL_PREFECTURE;
	readonly targetName: string;
};

export type MunicipalSelection = {
	readonly level: typeof REGION_LEVEL_MUNICIPALITY;
	readonly targetName: string;
	readonly prefectureName: string;
};

export type DomesticTourismSelection = PrefectureSelection | MunicipalSelection;

export type PrefectureTargetOptionsArgs = {
	readonly level: typeof REGION_LEVEL_PREFECTURE;
};

export type MunicipalityTargetOptionsArgs = {
	readonly level: typeof REGION_LEVEL_MUNICIPALITY;
	readonly prefectureName: string;
};

export type TargetOptionsArgs =
	| PrefectureTargetOptionsArgs
	| MunicipalityTargetOptionsArgs;

export type TourismPeriod = {
	readonly year: number;
	readonly month: number;
};

export type DomesticTourismRow = {
	readonly period: TourismPeriod;
	readonly targetName: string;
	readonly population: number;
};

export type DomesticTourismChartPoint = {
	readonly period: TourismPeriod;
	readonly population: number;
};

export type DomesticTourismSeries = {
	readonly label: string;
	readonly points: DomesticTourismChartPoint[];
};

const PERIOD_MONTH_PAD_LENGTH = 2;
const SELECTION_SEPARATOR = " / ";
const SELECTION_DELIMITER = ", ";

export const DATA_DIRECTORY = "/data/digital" as const;
export const PREFECTURE_FILE_PREFIX = "pref" as const;
export const MUNICIPALITY_FILE_PREFIX = "city" as const;
export const JSON_EXTENSION = ".json" as const;
export const DATA_YEARS = [2021, 2022, 2023] as const;

export const COLUMN_YEAR = "year" as const;
export const COLUMN_MONTH = "month" as const;
export const COLUMN_PREFECTURE = "prefecture_name" as const;
export const COLUMN_REGION = "region_name" as const;
export const COLUMN_POPULATION = "population" as const;
export const TARGET_ALIAS = "target_name" as const;

const SQL_WITH = "WITH" as const;
const SQL_SELECT = "SELECT" as const;
const SQL_UNION_ALL_SELECT = "UNION ALL SELECT" as const;
const SQL_DISTINCT = "DISTINCT" as const;
const SQL_ORDER_BY_ASC = "ASC" as const;

const MUNICIPAL_REGION_COLUMN = "regionName" as const;
const PREFECTURE_REGION_NULL = `NULL AS ${COLUMN_REGION}` as const;

/**
 * Create a normalised representation of a tourism period.
 */
export function createTourismPeriod(
	year: number,
	month: number,
): TourismPeriod {
	return { year, month };
}

/**
 * Compare two tourism periods from oldest to newest.
 */
export function compareTourismPeriod(
	left: TourismPeriod,
	right: TourismPeriod,
): number {
	if (left.year === right.year) {
		return left.month - right.month;
	}

	return left.year - right.year;
}

/**
 * Convert a period into an ISO-like string label (YYYY-MM).
 */
export function formatTourismPeriod(period: TourismPeriod): string {
	return `${period.year}-${period.month
		.toString()
		.padStart(PERIOD_MONTH_PAD_LENGTH, "0")}`;
}

function selectionsEqual(
	left: DomesticTourismSelection,
	right: DomesticTourismSelection,
): boolean {
	if (left.level !== right.level) {
		return false;
	}

	if (left.level === REGION_LEVEL_PREFECTURE) {
		return left.targetName === right.targetName;
	}

	return (
		left.targetName === right.targetName &&
		left.prefectureName === (right as MunicipalSelection).prefectureName
	);
}

/**
 * Toggle a domestic tourism selection while preserving immutability.
 */
export function toggleSelectionTarget(
	current: DomesticTourismSelection[],
	next: DomesticTourismSelection,
): DomesticTourismSelection[] {
	return current.some((entry) => selectionsEqual(entry, next))
		? current.filter((entry) => !selectionsEqual(entry, next))
		: [...current, next];
}

function describeSelection(selection: DomesticTourismSelection): string {
	if (selection.level === REGION_LEVEL_PREFECTURE) {
		return selection.targetName;
	}

	return `${selection.prefectureName}${SELECTION_SEPARATOR}${selection.targetName}`;
}

/**
 * Produce a comma-delimited list of selection labels for UI summaries.
 */
export function describeSelectionList(
	selections: DomesticTourismSelection[],
): string | null {
	if (selections.length === 0) {
		return null;
	}

	return selections.map(describeSelection).join(SELECTION_DELIMITER);
}

function escapeSqlLiteral(value: string): string {
	return value.replaceAll("'", "''");
}

function buildPrefectureMatchClause(prefectureName: string): string {
	return `${COLUMN_PREFECTURE} = '${escapeSqlLiteral(prefectureName)}'`;
}

function createReadJsonStatement(prefix: string): string {
	return DATA_YEARS.map((year, index) => {
		const filePath = `${DATA_DIRECTORY}/${prefix}${year}${JSON_EXTENSION}`;
		const unionKeyword = index === 0 ? SQL_SELECT : SQL_UNION_ALL_SELECT;
		const regionExpression =
			prefix === PREFECTURE_FILE_PREFIX
				? PREFECTURE_REGION_NULL
				: `${MUNICIPAL_REGION_COLUMN} AS ${COLUMN_REGION}`;

		return `${unionKeyword}
  ${COLUMN_YEAR},
  ${COLUMN_MONTH},
  prefectureName AS ${COLUMN_PREFECTURE},
  ${regionExpression},
  ${COLUMN_POPULATION}
FROM read_json('${filePath}')`;
	}).join("\n");
}

function buildWhereClause(selection: DomesticTourismSelection): string {
	const prefectureFilter = buildPrefectureMatchClause(
		selection.level === REGION_LEVEL_MUNICIPALITY
			? selection.prefectureName
			: selection.targetName,
	);

	if (selection.level === REGION_LEVEL_PREFECTURE) {
		return prefectureFilter;
	}

	return `${prefectureFilter}
  AND ${COLUMN_REGION} = '${escapeSqlLiteral(selection.targetName)}'`;
}

function selectTargetColumn(level: RegionLevel): string {
	return level === REGION_LEVEL_PREFECTURE ? COLUMN_PREFECTURE : COLUMN_REGION;
}

function selectFilePrefix(level: RegionLevel): string {
	return level === REGION_LEVEL_PREFECTURE
		? PREFECTURE_FILE_PREFIX
		: MUNICIPALITY_FILE_PREFIX;
}

/**
 * Build a DuckDB SQL statement that aggregates monthly population for a selection.
 */
export function buildDomesticTourismQuery(
	selection: DomesticTourismSelection,
): string {
	const prefix = selectFilePrefix(selection.level);
	const whereClause = buildWhereClause(selection);
	const targetColumn = selectTargetColumn(selection.level);

	return `${SQL_WITH} source_data AS (
${createReadJsonStatement(prefix)}
)
SELECT
  ${COLUMN_YEAR},
  ${COLUMN_MONTH},
  ${targetColumn} AS ${TARGET_ALIAS},
  SUM(${COLUMN_POPULATION}) AS ${COLUMN_POPULATION}
FROM source_data
WHERE ${whereClause}
GROUP BY ${COLUMN_YEAR}, ${COLUMN_MONTH}, ${TARGET_ALIAS}
ORDER BY ${COLUMN_YEAR}, ${COLUMN_MONTH};`;
}

/**
 * Build a DuckDB SQL statement that lists selectable target names.
 */
export function buildTargetOptionsQuery(args: TargetOptionsArgs): string {
	const prefix = selectFilePrefix(args.level);
	const targetColumn = selectTargetColumn(args.level);
	const whereClause =
		args.level === REGION_LEVEL_MUNICIPALITY
			? `WHERE ${buildPrefectureMatchClause(args.prefectureName)}`
			: "";

	return `SELECT ${SQL_DISTINCT} ${targetColumn}
FROM (
${createReadJsonStatement(prefix)}
) AS source_data
${whereClause}
ORDER BY ${targetColumn} ${SQL_ORDER_BY_ASC};`;
}

/**
 * Order raw query rows and shape them for downstream chart consumption.
 */
export function mapRowsToChartSeries({
	rows,
	targetLabel,
}: {
	readonly rows: DomesticTourismRow[];
	readonly targetLabel: string;
}): DomesticTourismSeries {
	const points = [...rows]
		.sort((left, right) => compareTourismPeriod(left.period, right.period))
		.map((row) => ({
			period: row.period,
			population: row.population,
		}));

	return {
		label: targetLabel,
		points,
	};
}
