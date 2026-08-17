import type { RoutedLeg } from '../../lib/favorites/enrich-route.ts';

/** Real-routing cache keyed by (fromId, toId, mode). Reorders and drags reuse
 *  it, so a re-render never refetches a pair it already resolved. */
export const legCache = new Map<string, RoutedLeg | undefined>();
