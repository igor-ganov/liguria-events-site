// An event that runs every year is one thing with many editions, and the site
// held them as strangers: 2349 archived pages, each a dead end, and this
// year's page never mentioning that last year's exists.
import { describe, expect, test } from 'bun:test';
import { editionKey } from '../src/lib/events/edition-key.ts';
import { otherEditions } from '../src/lib/events/other-editions.ts';
import type { ArchivedEvent } from '../src/lib/events/archived-schema.ts';

const entry = (over: Partial<ArchivedEvent> & Pick<ArchivedEvent, 'id' | 't' | 's'>): ArchivedEvent => ({
  ct: 'genova',
  ...over,
});

describe('editionKey', () => {
  test('the year is what changes between editions, so it is not part of the name', () => {
    expect(editionKey(entry({ id: 'a', t: 'Sagra del Fuoco di Recco 2026', s: '2026-09-04' }))).toBe(
      editionKey(entry({ id: 'b', t: 'Sagra del Fuoco di Recco 2027', s: '2027-09-03' })),
    );
  });

  test('an ordinal changes between editions too', () => {
    // "4^ Festa dell'Olio" and "5ª Festa dell'Olio" are the same feast.
    expect(editionKey(entry({ id: 'a', t: "4^ Festa dell'Olio ad Anagni", s: '2026-11-01' }))).toBe(
      editionKey(entry({ id: 'b', t: "5ª Festa dell'Olio ad Anagni", s: '2027-11-01' })),
    );
  });

  test('two towns keep their own feast', () => {
    expect(editionKey(entry({ id: 'a', t: 'Festa Patronale', s: '2026-09-12', ct: 'latina' }))).not.toBe(
      editionKey(entry({ id: 'b', t: 'Festa Patronale', s: '2026-09-12', ct: 'milano' })),
    );
  });

  test('two different events in one town are not editions of each other', () => {
    expect(editionKey(entry({ id: 'a', t: 'Sagra del Fuoco', s: '2026-09-04' }))).not.toBe(
      editionKey(entry({ id: 'b', t: 'Sagra del Pesto', s: '2026-09-04' })),
    );
  });
});

describe('otherEditions', () => {
  const recco2026 = entry({ id: 'r26', t: 'Sagra del Fuoco di Recco 2026', s: '2026-09-04' });
  const recco2025 = entry({ id: 'r25', t: 'Sagra del Fuoco di Recco 2025', s: '2025-09-05' });
  const recco2027 = entry({ id: 'r27', t: 'Sagra del Fuoco di Recco 2027', s: '2027-09-03' });
  const other = entry({ id: 'x', t: 'Oktoberfest Genova 2026', s: '2026-09-19' });

  test('the same event in other years, newest first, never itself', () => {
    const found = otherEditions(recco2026, [recco2025, recco2026, recco2027, other]);
    expect(found.map((edition) => edition.id)).toEqual(['r27', 'r25']);
  });

  test('an event nobody has held twice offers nothing', () => {
    expect(otherEditions(other, [recco2025, recco2026, other])).toEqual([]);
  });

  test('two records of one edition are not two editions', () => {
    // The same year seen twice — a duplicate that dedupe has not merged yet —
    // must not render as "also in 2026, and 2026".
    const twin = entry({ id: 'r26b', t: 'Sagra del Fuoco di Recco 2026', s: '2026-09-04' });
    expect(otherEditions(recco2026, [recco2026, twin, recco2025]).map((e) => e.id)).toEqual(['r25']);
  });
});
