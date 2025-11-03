/**
 * @file DuckDB SQL builders for domestic tourism aggregations.
 */
import {
	COLUMN_MONTH,
	COLUMN_POPULATION,
	COLUMN_PREFECTURE,
	COLUMN_REGION,
	COLUMN_YEAR,
	DATA_DIRECTORY,
	DATA_YEARS,
	JSON_EXTENSION,
	MUNICIPALITY_FILE_PREFIX,
	PREFECTURE_FILE_PREFIX,
	TARGET_ALIAS,
} from "./constants";
import {
	REGION_LEVEL_MUNICIPALITY,
	REGION_LEVEL_PREFECTURE,
	type RegionLevel,
} from "./region";
import type { DomesticTourismSelection, TargetOptionsArgs } from "./selection";

const UNION_SELECT = "SELECT";
const UNION_ALL_SELECT = "UNION ALL SELECT";

function escapeSqlLiteral(value: string) {
	return value.replaceAll("'", "''");
}

function buildPrefectureMatchClause(prefectureName: string) {
	return `${COLUMN_PREFECTURE} = '${escapeSqlLiteral(prefectureName)}'`;
}

function createReadJsonStatement(prefix: string) {
	return DATA_YEARS.map((year, index) => {
		const filePath = `${DATA_DIRECTORY}/${prefix}${year}${JSON_EXTENSION}`;
		const unionKeyword = index === 0 ? UNION_SELECT : UNION_ALL_SELECT;
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

function selectFilePrefix(level: RegionLevel) {
	return level === REGION_LEVEL_PREFECTURE
		? PREFECTURE_FILE_PREFIX
		: MUNICIPALITY_FILE_PREFIX;
}

/**
 * Build a DuckDB SQL statement that aggregates monthly population for a selection.
 */
export function buildDomesticTourismQuery(selection: DomesticTourismSelection) {
	const prefix = selectFilePrefix(selection.level);
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

/**
 * Build a DuckDB SQL statement that lists selectable target names.
 */
export function buildTargetOptionsQuery(args: TargetOptionsArgs) {
	const prefix = selectFilePrefix(args.level);
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
