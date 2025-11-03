/**
 * @file DuckDB initialisation helpers for domestic tourism analytics.
 */
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker";
import duckdbWasm from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";

import {
	REGION_LEVEL_PREFECTURE,
	REGION_LEVEL_MUNICIPALITY,
	type DomesticTourismSelection,
	type DomesticTourismSeries,
	buildDomesticTourismQuery,
	buildTargetOptionsQuery,
	mapRowsToChartSeries,
} from "../../src/types/domestic-tourism";
import type { DomesticTourismRow } from "../../src/types/domestic-tourism";
import type { FetchResult } from "../../src/types/fetch";

const REGISTERED_JSON_FILES = [
	"/data/digital/pref2021.json",
	"/data/digital/pref2022.json",
	"/data/digital/pref2023.json",
	"/data/digital/city2021.json",
	"/data/digital/city2022.json",
	"/data/digital/city2023.json",
] as const;

type TourismDatabase = {
	db: duckdb.AsyncDuckDB;
	dispose: () => Promise<void>;
};

async function fetchJsonBuffer(path: string) {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${path}: ${response.status}`);
	}

	const text = await response.text();
	return new TextEncoder().encode(text);
}

async function registerJsonFiles(db: duckdb.AsyncDuckDB) {
	const buffers = await Promise.all(
		REGISTERED_JSON_FILES.map(async (path) => ({
			path,
			buffer: await fetchJsonBuffer(path),
		})),
	);

	for (const entry of buffers) {
		await db.registerFileBuffer(entry.path, entry.buffer);
	}
}

async function loadExtensions(db: duckdb.AsyncDuckDB) {
	const conn = await db.connect();
	try {
		await conn.query(`
      INSTALL httpfs;
      LOAD httpfs;
      INSTALL json;
      LOAD json;
    `);
	} finally {
		await conn.close();
	}
}

/**
 * Initialise DuckDB-WASM and register local JSON assets.
 */
export async function createTourismDatabase(): Promise<TourismDatabase> {
	const worker = new duckdbWorker();
	const logger = new duckdb.ConsoleLogger();
	const db = new duckdb.AsyncDuckDB(logger, worker);

	await db.instantiate(duckdbWasm);
	await loadExtensions(db);
	await registerJsonFiles(db);

	const dispose = async () => {
		for (const path of REGISTERED_JSON_FILES) {
			await db.dropFile(path).catch(() => {});
		}
		await db.terminate();
	};

	return { db, dispose };
}

type QueryRowsResult = FetchResult<DomesticTourismRow[], string>;

async function runQueryRows(
	db: duckdb.AsyncDuckDB,
	sql: string,
): Promise<QueryRowsResult> {
	const conn = await db.connect();
	try {
		const table = await conn.query(sql);
		const rows = table.toArray().map((row) => {
			const parsed = typeof row === "string" ? JSON.parse(row) : row;
			return {
				year: Number(parsed.year),
				month: Number(parsed.month),
				targetName: String(parsed.target_name ?? parsed.targetName ?? ""),
				population: Number(parsed.population),
			};
		});

		return {
			ok: true,
			data: rows,
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Unknown query error",
		};
	} finally {
		await conn.close();
	}
}

type QueryTargetsResult = FetchResult<string[], string>;

async function runQueryTargets(
	db: duckdb.AsyncDuckDB,
	sql: string,
): Promise<QueryTargetsResult> {
	const conn = await db.connect();
	try {
		const table = await conn.query(sql);
		const rows = table
			.toArray()
			.map((row) => (typeof row === "string" ? JSON.parse(row) : row))
			.map((parsed) =>
				String(parsed.prefecture_name ?? parsed.region_name ?? ""),
			);

		return {
			ok: true,
			data: rows,
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Unknown query error",
		};
	} finally {
		await conn.close();
	}
}

type SeriesResult = FetchResult<DomesticTourismSeries, string>;

/**
 * Execute the aggregation query and map the result for chart consumption.
 */
export async function queryTourismSeries(
	db: duckdb.AsyncDuckDB,
	selection: DomesticTourismSelection,
): Promise<SeriesResult> {
	const result = await runQueryRows(db, buildDomesticTourismQuery(selection));
	if (!result.ok) {
		return result;
	}

	const label =
		selection.level === REGION_LEVEL_MUNICIPALITY
			? `${selection.prefectureName} / ${selection.targetName}`
			: selection.targetName;

	return {
		ok: true,
		data: mapRowsToChartSeries({
			rows: result.data,
			targetLabel: label,
		}),
	};
}

type TargetOptionsArgs =
	| {
			level: typeof REGION_LEVEL_MUNICIPALITY;
			prefectureName: string;
	  }
	| {
			level: typeof REGION_LEVEL_PREFECTURE;
	  };

/**
 * List selectable target names for the current toggle state.
 */
export async function queryTargetOptions(
	db: duckdb.AsyncDuckDB,
	args: TargetOptionsArgs,
): Promise<QueryTargetsResult> {
	const result = await runQueryTargets(db, buildTargetOptionsQuery(args));
	if (!result.ok) {
		return result;
	}

	return {
		ok: true,
		data: result.data.filter((value) => value.length > 0),
	};
}
