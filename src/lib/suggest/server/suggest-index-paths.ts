/** Where the build leaves the semantic index (scripts/build-suggest-index.ts)
 *  and where the worker reads it from: the id list, then the int8 rows. */
export const SUGGEST_INDEX_PATHS: Readonly<{ meta: string; rows: string }> = { meta: '/data/suggest-index.json', rows: '/data/suggest-vectors.bin' };
