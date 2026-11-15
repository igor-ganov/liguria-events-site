// What a region's suggestion file and the embedding input carry: upcoming
// events, and the venues that have a page — never a link that would 404.
import { describe, expect, test } from 'bun:test';
import { suggestDocs } from '../src/lib/suggest/suggest-docs.ts';
import { embedDocs } from '../src/lib/suggest/embed-docs.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-11-15';
const BASE: CompactEvent = { id: 'x', t: 'Concerto jazz', s: '2026-11-20', c: ['music'], u: 'https://example.test/x', v: 'Louisiana Jazz Club', ct: 'genova', rg: 'liguria' };
const event = (over: Partial<CompactEvent>): CompactEvent => ({ ...BASE, ...over });

const corpus: readonly CompactEvent[] = [
  event({ id: 'jazz', tl: { en: 'Jazz concert', it: 'Concerto jazz', ru: 'Джазовый концерт' } }),
  event({ id: 'over', s: '2026-11-01' }),
  event({ id: 'vague', v: 'Luoghi vari' }),
  event({ id: 'facet', v: 'Today' }),
  event({ id: 'milan', rg: 'lombardia', ct: 'milano', v: 'Blue Note' }),
];

describe('suggestDocs', () => {
  const docs = suggestDocs(corpus, 'liguria', 'ru', TODAY);
  const ids = docs.map((doc) => doc.id);

  test('upcoming events of the region, titled in the language', () => {
    expect(ids).toContain('jazz');
    expect(docs.find((doc) => doc.id === 'jazz')?.title).toBe('Джазовый концерт');
    ['over', 'milan'].forEach((id) => expect(ids).not.toContain(id));
  });
  test('a venue only when it has a page of its own, with that page as its path', () => {
    const venue = docs.find((doc) => doc.kind === 'venue');
    expect(venue?.id).toBe('venue:liguria/genova/louisiana-jazz-club');
    expect(venue?.path).toBe('liguria/genova/louisiana-jazz-club/');
    expect(docs.filter((doc) => doc.kind === 'venue')).toHaveLength(1);
  });
});

describe('embedDocs', () => {
  const docs = embedDocs(corpus, TODAY);
  test('every region, both kinds, each with text to embed', () => {
    expect(docs.map((doc) => doc.id)).toContain('milan');
    expect(docs.map((doc) => doc.id)).toContain('venue:lombardia/milano/blue-note');
    expect(docs.every((doc) => doc.text.length > 0)).toBe(true);
  });
  test('a venue is described by what it hosts, so a query by kind of event finds it', () => {
    expect(docs.find((doc) => doc.id === 'venue:liguria/genova/louisiana-jazz-club')?.text).toContain('Concerto jazz');
  });
});
