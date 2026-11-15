import { parseSemantic } from '../../lib/suggest/parse-semantic.ts';
import type { SemanticIds } from '../../lib/suggest/suggest-doc.ts';

/**
 * What the worker finds by meaning, or nothing — offline, the endpoint down,
 * an index not built, the request overtaken by the next keystroke. Every one
 * of those leaves the letters' suggestions on screen. Repeats are answered by
 * the browser's own cache: the endpoint marks answers fresh for ten minutes.
 */
export const semanticIds = (region: string, query: string, signal: AbortSignal): Promise<SemanticIds | undefined> =>
  fetch(`/api/suggest?rg=${encodeURIComponent(region)}&q=${encodeURIComponent(query)}`, { signal, headers: { accept: 'application/json' } })
    .then((answer) => [answer].filter((found) => found.ok).map((found) => found.json()).at(0))
    .then(parseSemantic)
    .catch(() => undefined);
