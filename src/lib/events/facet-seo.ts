import type { FeedScope } from './feed-events.ts';
import type { Ui } from '../i18n/ui-schema.ts';

// The dictionary key each facet's copy lives under.
const KEYS: Readonly<Record<string, keyof Ui['facets']>> = {
  today: 'today',
  tomorrow: 'tomorrow',
  'this-weekend': 'weekend',
  free: 'free',
};

/** The title and description of a facet page, or nothing when the page is not
 *  one. Each facet says what it is: "What's on today in Genova" is the phrase
 *  somebody types, and it has to be the page's own. */
export const facetSeo = (
  scope: FeedScope,
  ui: Ui,
): Readonly<{ title: string; description: string }> | undefined =>
  [scope.facet?.slug ?? '']
    .flatMap((slug) => [KEYS[slug]])
    .filter((key): key is keyof Ui['facets'] => key !== undefined)
    .map((key) => ui.facets[key])
    .at(0);
