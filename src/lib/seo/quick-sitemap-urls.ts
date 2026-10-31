import { feedEvents } from '../events/feed-events.ts';
import { facetOf } from '../events/facet-of.ts';
import { isDefined } from '../is-defined.ts';
import { QUICK_SLUGS } from '../quick/quick-slugs.ts';
import { regionsOf } from '../region/regions-of.ts';
import { sitemapRow } from './sitemap-row.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

const QUICK_FACETS = Object.values(QUICK_SLUGS).map(facetOf).filter(isDefined);

/**
 * A region's quick pages — tonight, this weekend, Sunday evening — while they
 * have something in them: the facet sitemap's rule, one tier up. A city's are
 * among its facets (facetSitemapUrls).
 */
export const quickSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  regionsOf(events).flatMap((region) =>
    QUICK_FACETS.filter((facet) => feedEvents(events, { region: region.slug, facet, today }).length > 0).map((facet) =>
      sitemapRow(`${region.slug}/${facet.slug}/`, today, site),
    ),
  );
