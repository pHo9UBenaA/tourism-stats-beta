/**
 * @file Domain model and query helpers for domestic tourism datasets backed by DuckDB.
 */

type RegionLevelPrefecture = typeof REGION_LEVEL_PREFECTURE;
type RegionLevelMunicipality = typeof REGION_LEVEL_MUNICIPALITY;
type RegionLevelValue = RegionLevelPrefecture | RegionLevelMunicipality;

const DATA_DIRECTORY = "/data/digital";
const PREFECTURE_FILE_PREFIX = "pref";
const MUNICIPALITY_FILE_PREFIX = "city";
const JSON_EXTENSION = ".json";
const DATA_YEARS = [2021, 2022, 2023] as const;
const COLUMN_YEAR = "year";
const COLUMN_MONTH = "month";
const COLUMN_PREFECTURE = "prefecture_name";
const COLUMN_REGION = "region_name";
const COLUMN_POPULATION = "population";
const TARGET_ALIAS = "target_name";

/**
 * Toggle identifier for prefecture scoped aggregations.
 */
export const REGION_LEVEL_PREFECTURE = "prefecture" as const;

/**
 * Toggle identifier for municipality scoped aggregations.
 */
export const REGION_LEVEL_MUNICIPALITY = "municipality" as const;

export type RegionLevel = RegionLevelValue;

export type DomesticTourismSelection =
	| {
			level: RegionLevelPrefecture;
			targetName: string;
	  }
	| {
			level: RegionLevelMunicipality;
			targetName: string;
			prefectureName: string;
	  };

function escapeSqlLiteral(value: string) {
	return value.replaceAll("'", "''");
}

function buildPrefectureMatchClause(prefectureName: string) {
	return `${COLUMN_PREFECTURE} = '${escapeSqlLiteral(prefectureName)}'`;
}

function createReadJsonStatement(prefix: string) {
	return DATA_YEARS.map((year, index) => {
		const filePath = `${DATA_DIRECTORY}/${prefix}${year}${JSON_EXTENSION}`;
		const unionKeyword = index === 0 ? "SELECT" : "UNION ALL SELECT";
		const regionExpression =
			prefix === PREFECTURE_FILE_PREFIX
				? `NULL AS ${COLUMN_REGION}`
				: `regionName AS ${COLUMN_REGION}`;

		return `${unionKeyword}
  ${COLUMN_YEAR},
  ${COLUMN_MONTH},
  prefectureName AS ${COLUMN_PREFECTURE},
  ${regionExpression},
  ${COLUMN_POPULATION}
FROM read_json('${filePath}')`;
	}).join("\n");
}

function buildWhereClause(selection: DomesticTourismSelection) {
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

function selectTargetColumn(level: RegionLevel) {
	return level === REGION_LEVEL_PREFECTURE ? COLUMN_PREFECTURE : COLUMN_REGION;
}

/**
 * Build a DuckDB SQL statement that aggregates monthly population for a selection.
 */
export function buildDomesticTourismQuery(selection: DomesticTourismSelection) {
	const prefix =
		selection.level === REGION_LEVEL_PREFECTURE
			? PREFECTURE_FILE_PREFIX
			: MUNICIPALITY_FILE_PREFIX;
	const whereClause = buildWhereClause(selection);
	const targetColumn = selectTargetColumn(selection.level);

	return `WITH source_data AS (
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

type TargetOptionsArgs =
	| {
			level: RegionLevelPrefecture;
	  }
	| {
			level: RegionLevelMunicipality;
			prefectureName: string;
	  };

/**
 * Build a DuckDB SQL statement that lists selectable target names.
 */
export function buildTargetOptionsQuery(args: TargetOptionsArgs) {
	const prefix =
		args.level === REGION_LEVEL_PREFECTURE
			? PREFECTURE_FILE_PREFIX
			: MUNICIPALITY_FILE_PREFIX;
	const targetColumn = selectTargetColumn(args.level);
	const whereClause =
		args.level === REGION_LEVEL_MUNICIPALITY
			? `WHERE ${buildPrefectureMatchClause(args.prefectureName)}`
			: "";

	return `SELECT DISTINCT ${targetColumn}
FROM (
${createReadJsonStatement(prefix)}
) AS source_data
${whereClause}
ORDER BY ${targetColumn} ASC;`;
}

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
