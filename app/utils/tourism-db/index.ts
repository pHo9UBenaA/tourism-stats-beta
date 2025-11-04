/**
 * @file Tourism database utilities.
 * @description Composes bootstrapping, registration, and query layers so UI
 * features interact with DuckDB through FetchResult-returning helpers.
 */
import type * as duckdb from "@duckdb/duckdb-wasm";

import type { FetchResult } from "../../../src/types/fetch";
import { instantiateDuckDb, loadDuckDbExtensions } from "./boot";
import { dropTourismDatasets, registerTourismDatasets } from "./registration";
export { queryTargetOptions, queryTourismSeries } from "./queries";

export type TourismDatabase = {
	readonly db: duckdb.AsyncDuckDB;
	readonly dispose: () => Promise<void>;
};

/**
 * Initialise DuckDB-WASM and register domestic tourism datasets.
 */
export async function createTourismDatabase(): Promise<
	FetchResult<TourismDatabase, string>
> {
	const instanceResult = await instantiateDuckDb();
	if (!instanceResult.ok) {
		return instanceResult;
	}

	const db = instanceResult.data;
	const extensionResult = await loadDuckDbExtensions(db);
	if (!extensionResult.ok) {
		await db.terminate();
		return extensionResult;
	}

	const registrationResult = await registerTourismDatasets(db);
	if (!registrationResult.ok) {
		await dropTourismDatasets(db);
		await db.terminate();
		return registrationResult;
	}

	const dispose = async () => {
		await dropTourismDatasets(db);
		await db.terminate();
	};

	return {
		ok: true,
		data: { db, dispose },
	};
}
