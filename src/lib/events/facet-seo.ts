import { isCategory } from './is-category.ts';
import type { FeedScope } from './feed-events.ts';
import type { Ui } from '../i18n/ui-schema.ts';

// The dictionary key each facet's copy lives under.
const KEYS: Readonly<Record<string, keyof Ui['facets']>> = {
  today: 'today',
  tomorrow: 'tomorrow',
  'this-weekend': 'weekend',
  free: 'free',
};

// A category facet takes one template per language, filled from the category
// label that already exists in all three — sixty strings avoided.
const categorySeo = (slug: string, ui: Ui): Readonly<{ title: string; description: string }>[] =>
  [slug]
    .filter(isCategory)
    .map((category) => ({
      title: ui.facets.category.title.replace('{category}', ui.cat[category]),
      description: ui.facets.category.description.replace('{category}', ui.cat[category]),
    }));

/** The title and description of a facet page, or nothing when the page is not
 *  one. Each facet says what it is: "What's on today in Genova" is the phrase
 *  somebody types, and it has to be the page's own. */
export const facetSeo = (
  scope: FeedScope,
  ui: Ui,
): Readonly<{ title: string; description: string }> | undefined => {
  const slug = scope.facet?.slug ?? '';
  return [
    ...[KEYS[slug]].filter((key): key is keyof Ui['facets'] => key !== undefined).map((key) => ui.facets[key]),
    ...categorySeo(slug, ui),
  ].at(0);
};
