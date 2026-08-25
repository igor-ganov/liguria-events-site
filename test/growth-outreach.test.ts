// Backlink outreach is a short, hand-sent list. These are the parts that decide
// who is on it and whether a contact can be trusted without checking.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { matchVenueSite } from '../scripts/growth/match-venue-site.ts';
import { outreachTargets } from '../scripts/growth/outreach-targets.ts';
import { outreachLetter } from '../scripts/growth/outreach-letter.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const teatro = { name: 'Teatro Carlo Felice', lat: 44.4076, lng: 8.9339 };

describe('matchVenueSite', () => {
  test('takes a place whose name contains every significant word', () => {
    const site = matchVenueSite(teatro, [
      {
        name: 'Accademia di alto perfezionamento del Teatro Carlo Felice di Genova',
        website: 'http://www.carlofelicegenova.it/',
        lat: 44.4077,
        lng: 8.934,
      },
    ]);
    assert.equal(site, 'http://www.carlofelicegenova.it/');
  });

  test('refuses a partial name match — that is how a theatre became a bar', () => {
    const site = matchVenueSite(teatro, [
      { name: 'Carlo Felice', website: 'http://bar.example', lat: 44.4077, lng: 8.934 },
    ]);
    assert.equal(site, undefined);
  });

  test('refuses the right name in the wrong place', () => {
    const site = matchVenueSite(teatro, [
      { name: 'Teatro Carlo Felice', website: 'http://elsewhere.example', lat: 45.07, lng: 7.68 },
    ]);
    assert.equal(site, undefined);
  });

  test('ignores a place with no website — there is nothing to write to', () => {
    assert.equal(matchVenueSite(teatro, [{ name: 'Teatro Carlo Felice', lat: 44.4077, lng: 8.934 }]), undefined);
  });

  test('nothing nearby is nothing found', () => {
    assert.equal(matchVenueSite(teatro, []), undefined);
  });
});

const event = (over: Partial<CompactEvent> = {}): CompactEvent =>
  ({ id: Math.random().toString(36).slice(2, 14), t: 'Evento', s: '2026-09-01', c: [], u: 'https://e.example', ct: 'genova', rg: 'liguria', v: 'Teatro Carlo Felice', ...over }) as CompactEvent;

describe('outreachTargets', () => {
  const many = (n: number, over: Partial<CompactEvent> = {}) => Array.from({ length: n }, () => event(over));

  test('a venue with a real programme is worth writing to', () => {
    const targets = outreachTargets(many(5));
    assert.ok(targets.some((t) => t.kind === 'venue' && t.name === 'Teatro Carlo Felice'));
  });

  test('a venue with one event is not — that is asking a favour, not offering one', () => {
    const targets = outreachTargets(many(1));
    assert.equal(targets.filter((t) => t.kind === 'venue').length, 0);
  });

  test('a busy city gets its comune on the list, with the page that justifies it', () => {
    const targets = outreachTargets(many(10));
    const comune = targets.find((t) => t.kind === 'comune');
    assert.equal(comune?.name, 'Comune di Genova');
    assert.equal(comune?.page, 'https://dovego.it/it/liguria/genova/');
  });

  test('the list stays short — outreach at volume is the scheme Google punishes', () => {
    const targets = outreachTargets(many(400), { venues: 20, comuni: 10 });
    assert.ok(targets.length <= 30, `got ${targets.length}`);
  });
});

describe('outreachLetter', () => {
  const [venue] = outreachTargets(Array.from({ length: 5 }, () => event()));

  test('leads with what is already done for them, and links the page', () => {
    const letter = outreachLetter(venue!);
    assert.ok(letter.includes('Teatro Carlo Felice'));
    assert.ok(letter.includes('https://dovego.it/it/liguria/genova/teatro-carlo-felice/'));
  });

  test('offers a way out — an aggregator nobody can opt out of is a nuisance', () => {
    // The phrase wraps in the letter, so assert on the promise, not the layout.
    assert.ok(outreachLetter(venue!).includes('non compaia'));
  });

  test('never mentions SEO or asks for a reciprocal link', () => {
    const letter = outreachLetter(venue!).toLowerCase();
    assert.ok(!letter.includes('seo'));
    assert.ok(!letter.includes('scambio'));
  });
});
