// The title of a feed page is the one string a search result is made of, and
// for a year it was "{place} — Feed": the English dictionary's navigation
// label, printed where the question belongs. Live on 2026-10-05:
// /liguria/genova/ titled itself "Genova — Feed · Dove Go".
//
// A feed page covers a city or a region, and Italian takes a different
// preposition for each ("a Genova", "in Liguria"), so the place leads and no
// preposition is needed at all.
import { describe, expect, test } from 'bun:test';
import { feedTitle } from '../src/lib/events/feed-title.ts';
import type { Ui } from '../src/lib/i18n/ui-schema.ts';

const ui = {
  nav: { feed: 'Feed' },
  seo: { feedTitle: '{place}: cosa fare ed eventi' },
} as unknown as Ui;

describe('feedTitle', () => {
  test('asks the question the reader typed', () => {
    expect(feedTitle(ui, 'Genova')).toBe('Genova: cosa fare ed eventi');
  });

  test('works for a region as well as a city, which is why there is no preposition', () => {
    expect(feedTitle(ui, 'Liguria')).toBe('Liguria: cosa fare ed eventi');
  });

  test('and never says the navigation label out loud', () => {
    expect(feedTitle(ui, 'Genova')).not.toContain('Feed');
  });
});
