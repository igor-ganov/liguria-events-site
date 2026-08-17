// Parse/serialise a saved route's payload and load the corpus. Shared by the
// read-only view and the owner editor so both agree on the on-disk shape:
// { mode, dayIds: [{ day, ids }], durations }. This module is the stable import
// surface; every reader lives one function per file next to it and is
// unit-tested on its own.
export type { Payload } from './payload-types.ts';
export { parsePayload } from './parse-payload.ts';
export { serializePayload } from './serialize-payload.ts';
export { fetchCorpus } from './fetch-corpus.ts';
