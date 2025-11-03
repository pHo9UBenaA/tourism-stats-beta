/**
 * @file DuckDB initialisation helpers for domestic tourism analytics.
 */
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker";
import duckdbWasm from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";

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
	REGION_LEVEL_PREFECTURE,
	TARGET_ALIAS,
	createTourismPeriod,
	describeSelectionList,
	type DomesticTourismRow,
	type DomesticTourismSelection,
	type DomesticTourismSeries,
	type TargetOptionsArgs,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	mapRowsToChartSeries,
} from "../../src/types/domestic-tourism";
import type { FetchResult } from "../../src/types/fetch";

const DATASET_PREFIXES = [
	PREFECTURE_FILE_PREFIX,
	MUNICIPALITY_FILE_PREFIX,
] as const;

const REGISTERED_JSON_FILES = DATA_YEARS.flatMap((year) =>
	DATASET_PREFIXES.map(
		(prefix) => `${DATA_DIRECTORY}/${prefix}${year}${JSON_EXTENSION}`,
	),
);

const EXTENSION_SETUP_SQL = `
  INSTALL httpfs;
  LOAD httpfs;
  INSTALL json;
  LOAD json;
`;

const ERROR_INSTANTIATE = "Failed to instantiate DuckDB" as const;
const ERROR_EXTENSION = "Failed to load DuckDB extensions" as const;
const ERROR_REGISTER = "Failed to register tourism datasets" as const;
const ERROR_FETCH_PREFIX = "Failed to fetch" as const;
const ERROR_UNKNOWN_QUERY = "Unknown query error" as const;

type DuckDbResult = FetchResult<duckdb.AsyncDuckDB, string>;
type VoidResult = FetchResult<void, string>;
type BufferResult = FetchResult<Uint8Array, string>;
type QueryTargetsResult = FetchResult<string[], string>;
type SeriesResult = FetchResult<DomesticTourismSeries, string>;

export type TourismDatabase = {
	readonly db: duckdb.AsyncDuckDB;
	readonly dispose: () => Promise<void>;
};

async function instantiateDuckDb(): Promise<DuckDbResult> {
	try {
		const worker = new duckdbWorker();
		const logger = new duckdb.ConsoleLogger();
		const db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(duckdbWasm);
		return { ok: true, data: db };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_INSTANTIATE,
		};
	}
}

async function loadDuckDbExtensions(
	db: duckdb.AsyncDuckDB,
): Promise<VoidResult> {
	const connection = await db.connect();
	try {
		await connection.query(EXTENSION_SETUP_SQL);
		return { ok: true, data: undefined };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_EXTENSION,
		};
	} finally {
		await connection.close();
	}
}

async function fetchJsonBuffer(path: string): Promise<BufferResult> {
	try {
		const response = await fetch(path);
		if (!response.ok) {
			return {
				ok: false,
				error: `${ERROR_FETCH_PREFIX} ${path}: ${response.status}`,
			};
		}

		const text = await response.text();
		return {
			ok: true,
			data: new TextEncoder().encode(text),
		};
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: `${ERROR_FETCH_PREFIX} ${path}`,
		};
	}
}

async function registerJsonFile(
	db: duckdb.AsyncDuckDB,
	path: string,
): Promise<VoidResult> {
	const bufferResult = await fetchJsonBuffer(path);
	if (!bufferResult.ok) {
		return bufferResult;
	}

	try {
		await db.registerFileBuffer(path, bufferResult.data);
		return { ok: true, data: undefined };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_REGISTER,
		};
	}
}

async function registerTourismData(
	db: duckdb.AsyncDuckDB,
): Promise<VoidResult> {
	for (const path of REGISTERED_JSON_FILES) {
		const result = await registerJsonFile(db, path);
		if (!result.ok) {
			return result;
		}
	}

	return { ok: true, data: undefined };
}

async function dropTourismData(db: duckdb.AsyncDuckDB) {
	await Promise.all(
		REGISTERED_JSON_FILES.map((path) => db.dropFile(path).catch(() => {})),
	);
}

/**
 * Initialise DuckDB-WASM and register local JSON assets.
 */
export async function createTourismDatabase(): Promise<
	FetchResult<TourismDatabase, string>
> {
	const dbResult = await instantiateDuckDb();
	if (!dbResult.ok) {
		return dbResult;
	}

	const db = dbResult.data;
	const extensionResult = await loadDuckDbExtensions(db);
	if (!extensionResult.ok) {
		await db.terminate();
		return extensionResult;
	}

	const registrationResult = await registerTourismData(db);
	if (!registrationResult.ok) {
		await dropTourismData(db);
		await db.terminate();
		return registrationResult;
	}

	const dispose = async () => {
		await dropTourismData(db);
		await db.terminate();
	};

	return {
		ok: true,
		data: { db, dispose },
	};
}

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
): Promise<FetchResult<T[], string>> {
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
): Promise<QueryTargetsResult> {
	const targetColumn =
		args.level === REGION_LEVEL_PREFECTURE ? COLUMN_PREFECTURE : COLUMN_REGION;

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
