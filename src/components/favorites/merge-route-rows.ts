import type { MyRoute } from './my-route-types.ts';

/** Server rows win over the local copy of the same id (they carry the real
 *  privacy state and ownership); local-only rows fill in the rest. */
export const mergeRouteRows = (
  server: readonly MyRoute[],
  local: readonly MyRoute[],
): readonly MyRoute[] => [
  ...new Map([...local, ...server].map((row): readonly [string, MyRoute] => [row.id, row])).values(),
];
