// An event its organiser has taken over exists twice: as the crawler found it,
// baked into every static page, and as the organiser keeps it, in the database.
// The feed has to end up showing the second. These are the two pure halves of
// that: what the server sends, and how a list already in hand takes it in.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { keptByOrganisers } from '../src/lib/events/kept-by-organisers.ts';
import { overrideById } from '../src/lib/events/override-by-id.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const crawled: CompactEvent = { id: 'aaa', t: 'Found title', s: '2026-11-01', c: ['music'], u: 'https://source.example/a', rg: 'liguria', ct: 'genova', x: true };
const owned: CompactEvent = { id: 'aaa', t: 'Organiser title', s: '2026-11-02', c: ['theatre'], u: '' };

describe('what the server sends for events kept by their organisers', () => {
  test('the organiser has the last word, the crawler keeps what an organiser cannot state', () => {
    const [sent] = keptByOrganisers([crawled], [owned]);
    assert.deepEqual([sent?.t, sent?.s, sent?.c, sent?.u, sent?.rg, sent?.ct, sent?.x], ['Organiser title', '2026-11-02', ['theatre'], 'https://source.example/a', 'liguria', 'genova', true]);
  });
  test('each is marked as kept by its organiser', () => {
    assert.deepEqual(keptByOrganisers([crawled], [owned]).map((event) => event.ow), [true]);
  });
  test('one the crawler has since lost is still sent, as the organiser keeps it', () => {
    assert.deepEqual(keptByOrganisers([], [owned]).map((event) => [event.t, event.ow]), [['Organiser title', true]]);
  });
  test('nothing is sent for events nobody has taken over', () => {
    assert.deepEqual(keptByOrganisers([crawled], []), []);
  });
});

describe('how a list already in hand takes late events in', () => {
  const other: CompactEvent = { id: 'bbb', t: 'Other', s: '2026-11-03', c: ['music'], u: '' };
  const fresh: CompactEvent = { id: 'ccc', t: 'New', s: '2026-11-04', c: ['music'], u: '' };
  test('an event it already has is replaced where it stands', () => {
    assert.deepEqual(overrideById([crawled, other], [{ ...owned, ow: true }]).map((event) => event.t), ['Organiser title', 'Other']);
  });
  test('one it has not is added at the end', () => {
    assert.deepEqual(overrideById([crawled, other], [fresh]).map((event) => event.id), ['aaa', 'bbb', 'ccc']);
  });
  test('nothing late leaves it as it was', () => {
    assert.deepEqual(overrideById([crawled, other], []), [crawled, other]);
  });
});
