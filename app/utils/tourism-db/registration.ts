/**
 * @file Tourism dataset registration for DuckDB-WASM.
 * @description Fetches JSON assets derived from domain metadata and registers
 * them with DuckDB so downstream queries can read from virtual files.
 */
import type * as duckdb from "@duckdb/duckdb-wasm";

import {
	createTourismDatasetRegistrations,
	type TourismDatasetRegistration,
	normaliseTourismDataset,
} from "../../types/domestic-tourism";
import type { FetchResult } from "../../types/fetch";

const ERROR_FETCH_PREFIX = "Failed to fetch" as const;
const ERROR_REGISTER = "Failed to register tourism datasets" as const;

const DATASET_REGISTRATIONS = createTourismDatasetRegistrations();

type BufferResult = FetchResult<Uint8Array, string>;

/**
 * Order tourism dataset JSON text via domain-level normalisation.
 */
function normaliseDatasetText(text: string): string {
	try {
		const parsed = JSON.parse(text);
		const ordered = normaliseTourismDataset(parsed);
		return JSON.stringify(ordered);
	} catch {
		return text;
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
		const orderedText = normaliseDatasetText(text);
		return {
			ok: true,
			data: new TextEncoder().encode(orderedText),
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

async function registerDataset(
	db: duckdb.AsyncDuckDB,
	registration: TourismDatasetRegistration,
): Promise<FetchResult<void, string>> {
	const bufferResult = await fetchJsonBuffer(registration.path);
	if (!bufferResult.ok) {
		return bufferResult;
	}

	try {
		await db.registerFileBuffer(registration.path, bufferResult.data);
		return { ok: true, data: undefined };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : ERROR_REGISTER,
		};
	}
}

/**
 * Register all domain datasets with DuckDB.
 */
export async function registerTourismDatasets(
	db: duckdb.AsyncDuckDB,
): Promise<FetchResult<void, string>> {
	for (const registration of DATASET_REGISTRATIONS) {
		const result = await registerDataset(db, registration);
		if (!result.ok) {
			return result;
		}
	}

	return { ok: true, data: undefined };
}

/**
 * Drop registered datasets, ignoring unknown file errors.
 */
export async function dropTourismDatasets(
	db: duckdb.AsyncDuckDB,
): Promise<void> {
	await Promise.all(
		DATASET_REGISTRATIONS.map((registration) =>
			db.dropFile(registration.path).catch(() => {}),
		),
	);
}
