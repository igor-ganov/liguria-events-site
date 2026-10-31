import { feedPath } from '../region/feed-path.ts';
import type { FeedScope } from './feed-events.ts';

/** The in-site path of a feed page: a region, a city, and under either a facet;
 *  under a city, a venue. */
export const feedScopePath = (scope: Omit<FeedScope, 'today'>): string =>
  `${feedPath(scope.region, scope.city)}${[scope.facet?.slug ?? scope.venue?.slug].filter((slug) => slug !== undefined).map((slug) => `${slug}/`).join('')}`;
