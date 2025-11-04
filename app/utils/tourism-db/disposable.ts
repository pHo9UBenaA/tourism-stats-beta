/**
 * @file Disposable helpers for DuckDB connections.
 * @description Attaches async disposal semantics so using declarations can
 * automatically close DuckDB connections after use.
 */
import type * as duckdb from "@duckdb/duckdb-wasm";

type DisposableConnection = duckdb.AsyncDuckDBConnection & {
	[Symbol.asyncDispose](): Promise<void>;
};

function attachAsyncDispose(connection: duckdb.AsyncDuckDBConnection) {
	const disposable = connection as DisposableConnection;
	disposable[Symbol.asyncDispose] = async () => {
		await connection.close();
	};
	return disposable;
}

/**
 * Create a DuckDB connection that closes automatically when disposed.
 */
export async function createDisposableConnection(
	db: duckdb.AsyncDuckDB,
): Promise<DisposableConnection> {
	const connection = await db.connect();
	return attachAsyncDispose(connection);
}
