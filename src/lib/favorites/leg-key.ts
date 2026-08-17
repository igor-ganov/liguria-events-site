import type { Mode } from './route-types.ts';

/** Cache key for a directed pair under a travel mode. */
export const legKey = (fromId: string, toId: string, mode: Mode): string =>
  `${fromId}|${toId}|${mode}`;
