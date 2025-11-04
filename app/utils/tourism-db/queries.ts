/**
 * @file DuckDB query helpers for domestic tourism analytics.
 * @description Executes aggregation and option listing queries while mapping
 * records into domain shapes. All functions return FetchResult outcomes.
 */
import type * as duckdb from "@duckdb/duckdb-wasm";

import {
	COLUMN_MONTH,
	COLUMN_POPULATION,
	COLUMN_PREFECTURE,
	COLUMN_REGION,
	COLUMN_YEAR,
	TARGET_ALIAS,
	REGION_LEVEL_PREFECTURE,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	createTourismPeriod,
	describeSelectionList,
	mapRowsToChartSeries,
	type TargetOptionsArgs,
	type DomesticTourismRow,
	type DomesticTourismSelection,
	type DomesticTourismSeries,
} from "../../../src/types/domestic-tourism";
import type { FetchResult } from "../../../src/types/fetch";

const ERROR_UNKNOWN_QUERY = "Unknown query error" as const;

type QueryResult<T> = FetchResult<T[], string>;
type SeriesResult = FetchResult<DomesticTourismSeries, string>;

function toRecord(row: unknown): Record<string, unknown> {
	if (typeof row === "string") {
		return JSON.parse(row) as Record<string, unknown>;
	}

	return row as Record<string, unknown>;
}

function readNumber(record: Record<string, unknown>, key: string): number {
	const value = record[key];
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? 0 : parsed;
	}

	return Number(value ?? 0);
}

function readString(record: Record<string, unknown>, key: string): string {
	const value = record[key];
	if (typeof value === "string") {
		return value;
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

async function executeQuery<T>(
	db: duckdb.AsyncDuckDB,
	sql: string,
	mapRow: (record: Record<string, unknown>) => T,
): Promise<QueryResult<T>> {
	const connection = await db.connect();
	try {
		const table = await connection.query(sql);
		const rows = table.toArray().map((row) => mapRow(toRecord(row)));
		return { ok: true, data: rows };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_UNKNOWN_QUERY,
		};
	} finally {
		await connection.close();
	}
}

function mapToTourismRow(record: Record<string, unknown>): DomesticTourismRow {
	const year = readNumber(record, COLUMN_YEAR);
	const month = readNumber(record, COLUMN_MONTH);
	const target = readString(record, TARGET_ALIAS);
	const population = readNumber(record, COLUMN_POPULATION);

	return {
		period: createTourismPeriod(year, month),
		targetName: target,
		population,
	};
}

function mapToTargetName(
	column: typeof COLUMN_PREFECTURE | typeof COLUMN_REGION,
) {
	return (record: Record<string, unknown>) => readString(record, column);
}

function resolveTargetColumn(level: TargetOptionsArgs["level"]) {
	return level === REGION_LEVEL_PREFECTURE ? COLUMN_PREFECTURE : COLUMN_REGION;
}

/**
 * Execute the aggregation query and map the result for chart consumption.
 */
export async function queryTourismSeries(
	db: duckdb.AsyncDuckDB,
	selection: DomesticTourismSelection,
): Promise<SeriesResult> {
	const rowsResult = await executeQuery(
		db,
		buildDomesticTourismQuery(selection),
		mapToTourismRow,
	);
	if (!rowsResult.ok) {
		return {
			ok: false,
			error: rowsResult.error,
		};
	}

	const label = describeSelectionList([selection]) ?? selection.targetName;

	return {
		ok: true,
		data: mapRowsToChartSeries({ rows: rowsResult.data, targetLabel: label }),
	};
}

/**
 * List selectable target names for the current toggle state.
 */
export async function queryTargetOptions(
	db: duckdb.AsyncDuckDB,
	args: TargetOptionsArgs,
): Promise<FetchResult<string[], string>> {
	const targetColumn = resolveTargetColumn(args.level);

	const result = await executeQuery(
		db,
		buildTargetOptionsQuery(args),
		mapToTargetName(targetColumn),
	);
	if (!result.ok) {
		return result;
	}

	return {
		ok: true,
		data: result.data.filter((value) => value.length > 0),
	};
}
