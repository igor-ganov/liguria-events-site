import { SUGGEST_INDEX_PATHS } from './suggest-index-paths.ts';
import { parseVectorIndex } from './parse-vector-index.ts';
import type { VectorIndex } from '../vector-index.ts';

/** The one method of the static-assets binding the index is read through. */
export type AssetReader = Readonly<{ fetch: (url: string) => Promise<Response> }>;

// One read per isolate: the index only changes with a deploy, and a deploy is
// a new isolate. A failed read is not kept, so the next request tries again.
let loaded: Promise<VectorIndex | undefined> | undefined;

const read = (assets: AssetReader, origin: string): Promise<VectorIndex | undefined> =>
  Promise.all([
    assets.fetch(`${origin}${SUGGEST_INDEX_PATHS.meta}`).then((answer) => answer.json()),
    assets.fetch(`${origin}${SUGGEST_INDEX_PATHS.rows}`).then((answer) => answer.arrayBuffer()),
  ])
    .then(([meta, rows]) => parseVectorIndex(meta, rows))
    .catch(() => undefined);

/** The semantic index from the worker's own static assets, or nothing when
 *  the build could not make one — no credentials, the model down. */
export const loadVectorIndex = (assets: AssetReader, origin: string): Promise<VectorIndex | undefined> => {
  loaded = loaded ?? read(assets, origin);
  return loaded.then((index) => {
    [index].filter((found) => found === undefined).forEach(() => (loaded = undefined));
    return index;
  });
};
