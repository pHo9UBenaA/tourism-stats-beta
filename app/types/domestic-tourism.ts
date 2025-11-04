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

export type PrefectureOrderEntry = {
	readonly code: string;
	readonly name: string;
};

/**
 * Prefecture ordering defined by the Ministry of Internal Affairs codes.
 */
export const PREFECTURE_ORDER: readonly PrefectureOrderEntry[] = [
	{ code: "01", name: "北海道" },
	{ code: "02", name: "青森県" },
	{ code: "03", name: "岩手県" },
	{ code: "04", name: "宮城県" },
	{ code: "05", name: "秋田県" },
	{ code: "06", name: "山形県" },
	{ code: "07", name: "福島県" },
	{ code: "08", name: "茨城県" },
	{ code: "09", name: "栃木県" },
	{ code: "10", name: "群馬県" },
	{ code: "11", name: "埼玉県" },
	{ code: "12", name: "千葉県" },
	{ code: "13", name: "東京都" },
	{ code: "14", name: "神奈川県" },
	{ code: "15", name: "新潟県" },
	{ code: "16", name: "富山県" },
	{ code: "17", name: "石川県" },
	{ code: "18", name: "福井県" },
	{ code: "19", name: "山梨県" },
	{ code: "20", name: "長野県" },
	{ code: "21", name: "岐阜県" },
	{ code: "22", name: "静岡県" },
	{ code: "23", name: "愛知県" },
	{ code: "24", name: "三重県" },
	{ code: "25", name: "滋賀県" },
	{ code: "26", name: "京都府" },
	{ code: "27", name: "大阪府" },
	{ code: "28", name: "兵庫県" },
	{ code: "29", name: "奈良県" },
	{ code: "30", name: "和歌山県" },
	{ code: "31", name: "鳥取県" },
	{ code: "32", name: "島根県" },
	{ code: "33", name: "岡山県" },
	{ code: "34", name: "広島県" },
	{ code: "35", name: "山口県" },
	{ code: "36", name: "徳島県" },
	{ code: "37", name: "香川県" },
	{ code: "38", name: "愛媛県" },
	{ code: "39", name: "高知県" },
	{ code: "40", name: "福岡県" },
	{ code: "41", name: "佐賀県" },
	{ code: "42", name: "長崎県" },
	{ code: "43", name: "熊本県" },
	{ code: "44", name: "大分県" },
	{ code: "45", name: "宮崎県" },
	{ code: "46", name: "鹿児島県" },
	{ code: "47", name: "沖縄県" },
] as const;

const PREFECTURE_INDEX_BY_NAME = new Map(
	PREFECTURE_ORDER.map((entry, index) => [entry.name, index] as const),
);

const UNKNOWN_PREFECTURE_RANK = Number.POSITIVE_INFINITY;

/**
 * Resolve the prefecture ordering index for a given name.
 */
export function rankPrefectureName(name: string): number {
	return PREFECTURE_INDEX_BY_NAME.get(name) ?? UNKNOWN_PREFECTURE_RANK;
}

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

export const DEFAULT_MULTI_SERIES_TITLE = "Selected Regions" as const;

export type TourismDatasetRegistration = {
	readonly level: RegionLevel;
	readonly year: number;
	readonly path: string;
};

const PERIOD_MONTH_PAD_LENGTH = 2;
const SELECTION_SEPARATOR = " / ";
const SELECTION_DELIMITER = ", ";

export const DATA_DIRECTORY = "/data/digital" as const;
export const PREFECTURE_FILE_PREFIX = "pref" as const;
export const MUNICIPALITY_FILE_PREFIX = "city" as const;
export const JSON_EXTENSION = ".json" as const;
export const DATA_YEARS = [2021, 2022, 2023] as const;
export const DATASET_FIELD_YEAR = "year" as const;
export const DATASET_FIELD_MONTH = "month" as const;
export const DATASET_FIELD_PREFECTURE_NAME = "prefectureName" as const;
export const DATASET_FIELD_REGION_NAME = "regionName" as const;
const DATASET_COMPARE_LOCALE = "ja" as const;

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

function isSelectionForLevel(
	selection: DomesticTourismSelection,
	level: RegionLevel,
): boolean {
	return selection.level === level;
}

function isMunicipalSelectionForPrefecture(
	selection: DomesticTourismSelection,
	prefectureName: string,
): selection is MunicipalSelection {
	return (
		selection.level === REGION_LEVEL_MUNICIPALITY &&
		selection.prefectureName === prefectureName
	);
}

/**
 * Filter selections by level while preserving insertion order.
 */
export function filterSelectionsByLevel(
	selections: DomesticTourismSelection[],
	level: RegionLevel,
): DomesticTourismSelection[] {
	return selections.filter((selection) =>
		isSelectionForLevel(selection, level),
	);
}

/**
 * Project target names for the provided level.
 */
export function listTargetNamesForLevel(
	selections: DomesticTourismSelection[],
	level: RegionLevel,
): string[] {
	return filterSelectionsByLevel(selections, level).map(
		(selection) => selection.targetName,
	);
}

/**
 * List municipality target names scoped by prefecture.
 */
export function listMunicipalTargetsForPrefecture(
	selections: DomesticTourismSelection[],
	prefectureName: string,
): string[] {
	return selections
		.filter((selection) =>
			isMunicipalSelectionForPrefecture(selection, prefectureName),
		)
		.map((selection) => selection.targetName);
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

type DatasetRecord = Record<string, unknown>;

function toDatasetRecord(value: unknown): DatasetRecord {
	return value && typeof value === "object" ? (value as DatasetRecord) : {};
}

function readDatasetString(record: DatasetRecord, key: string): string {
	const value = record[key];
	return typeof value === "string" ? value : "";
}

function readDatasetNumber(record: DatasetRecord, key: string): number {
	const value = record[key];
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? 0 : parsed;
	}

	return 0;
}

function compareDatasetRecords(
	left: DatasetRecord,
	right: DatasetRecord,
): number {
	const yearDifference =
		readDatasetNumber(left, DATASET_FIELD_YEAR) -
		readDatasetNumber(right, DATASET_FIELD_YEAR);
	if (yearDifference !== 0) {
		return yearDifference;
	}

	const monthDifference =
		readDatasetNumber(left, DATASET_FIELD_MONTH) -
		readDatasetNumber(right, DATASET_FIELD_MONTH);
	if (monthDifference !== 0) {
		return monthDifference;
	}

	const leftPrefecture = readDatasetString(left, DATASET_FIELD_PREFECTURE_NAME);
	const rightPrefecture = readDatasetString(
		right,
		DATASET_FIELD_PREFECTURE_NAME,
	);
	const leftRank = rankPrefectureName(leftPrefecture);
	const rightRank = rankPrefectureName(rightPrefecture);
	if (leftRank !== rightRank) {
		return leftRank < rightRank ? -1 : 1;
	}

	if (leftPrefecture !== rightPrefecture) {
		return leftPrefecture.localeCompare(
			rightPrefecture,
			DATASET_COMPARE_LOCALE,
		);
	}

	const leftRegion = readDatasetString(left, DATASET_FIELD_REGION_NAME);
	const rightRegion = readDatasetString(right, DATASET_FIELD_REGION_NAME);
	return leftRegion.localeCompare(rightRegion, DATASET_COMPARE_LOCALE);
}

function sortDatasetEntries(entries: readonly unknown[]): unknown[] {
	const copy = [...entries];
	copy.sort((left, right) =>
		compareDatasetRecords(toDatasetRecord(left), toDatasetRecord(right)),
	);
	return copy;
}

/**
 * Sort dataset entries by year, month, and prefecture ordering.
 */
export function normaliseTourismDataset(value: unknown): unknown {
	if (Array.isArray(value)) {
		return sortDatasetEntries(value);
	}

	if (value && typeof value === "object") {
		const record = value as DatasetRecord;
		const records = record.records;
		if (Array.isArray(records)) {
			return {
				...record,
				records: sortDatasetEntries(records),
			};
		}
	}

	return value;
}

/**
 * Sort prefecture names by their administrative ordering codes.
 */
export function sortPrefectureNames(
	names: readonly string[],
): readonly string[] {
	return [...names].sort((left, right) => {
		const leftRank = rankPrefectureName(left);
		const rightRank = rankPrefectureName(right);
		if (leftRank !== rightRank) {
			return leftRank - rightRank;
		}

		return left.localeCompare(right, DATASET_COMPARE_LOCALE);
	});
}

const DATASET_LEVELS: readonly RegionLevel[] = [
	REGION_LEVEL_PREFECTURE,
	REGION_LEVEL_MUNICIPALITY,
];

/**
 * Describe tourism datasets available for DuckDB registration.
 */
export function createTourismDatasetRegistrations(): TourismDatasetRegistration[] {
	return DATA_YEARS.flatMap((year) =>
		DATASET_LEVELS.map((level) => ({
			level,
			year,
			path: `${DATA_DIRECTORY}/${selectFilePrefix(level)}${year}${JSON_EXTENSION}`,
		})),
	);
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

/**
 * Create ordered ISO period labels across a collection of series.
 */
export function deriveChartPeriodLabels(
	series: DomesticTourismSeries[],
): string[] {
	const periodsByKey = new Map<string, TourismPeriod>();

	series.forEach((entry) => {
		entry.points.forEach((point) => {
			const key = formatTourismPeriod(point.period);
			periodsByKey.set(key, point.period);
		});
	});

	return Array.from(periodsByKey.values())
		.sort((left, right) => compareTourismPeriod(left, right))
		.map((period) => formatTourismPeriod(period));
}

type ResolveTourismChartTitleArgs = {
	readonly series: DomesticTourismSeries[];
	readonly summary: string | null;
};

/**
 * Resolve a chart title either from summary text or fallback heuristics.
 */
export function resolveTourismChartTitle({
	series,
	summary,
}: ResolveTourismChartTitleArgs): string {
	if (summary && summary.length > 0) {
		return summary;
	}

	if (series.length === 1) {
		return series[0]?.label ?? DEFAULT_MULTI_SERIES_TITLE;
	}

	return DEFAULT_MULTI_SERIES_TITLE;
}
