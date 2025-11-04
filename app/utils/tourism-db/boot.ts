/**
 * @file Bootstrapping helpers for DuckDB-WASM.
 * @description Provides factory functions to instantiate the database and load
 * required extensions while returning FetchResult outcomes.
 */
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker";
import duckdbWasm from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";

import type { FetchResult } from "../../types/fetch";
import { createDisposableConnection } from "./disposable";

const EXTENSION_SETUP_SQL = `
  INSTALL httpfs;
  LOAD httpfs;
  INSTALL json;
  LOAD json;
`;

const ERROR_INSTANTIATE = "Failed to instantiate DuckDB" as const;
const ERROR_EXTENSION = "Failed to load DuckDB extensions" as const;

export type DuckDbInstanceResult = FetchResult<duckdb.AsyncDuckDB, string>;

/**
 * Create a DuckDB instance backed by the WASM worker.
 */
export async function instantiateDuckDb(): Promise<DuckDbInstanceResult> {
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

/**
 * Load DuckDB extensions required for JSON ingestion.
 */
export async function loadDuckDbExtensions(
	db: duckdb.AsyncDuckDB,
): Promise<FetchResult<void, string>> {
	await using connection = await createDisposableConnection(db);
	try {
		await connection.query(EXTENSION_SETUP_SQL);
		return { ok: true, data: undefined };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_EXTENSION,
		};
	}
}
