import type { Ui } from '../i18n/ui-schema.ts';

/**
 * The title of a feed page.
 *
 * It was `{place} — ${ui.nav.feed}`: the navigation label, printed where the
 * question belongs, so the English page titled itself "Genova — Feed" and the
 * heading under it said the same. The question people type is "cosa fare a
 * Genova" and "eventi genova", and this is the one string a search result is
 * made of.
 *
 * The place leads and no preposition follows it, because the same template
 * covers a city and a region and Italian takes a different one for each —
 * "a Genova", but "in Liguria".
 */
export const feedTitle = (ui: Ui, placeName: string): string =>
  ui.seo.feedTitle.replace('{place}', placeName);
