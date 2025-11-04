/**
 * @file Shared algebraic data type for fetch-like results.
 */

export type FetchResult<T, E> =
	| {
			ok: true;
			data: T;
	  }
	| {
			ok: false;
			error: E;
	  };
