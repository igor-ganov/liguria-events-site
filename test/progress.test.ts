// The roadmap and the release notes are written by hand, for readers, in three
// languages — which is three chances per entry to leave one blank, and a blank
// renders as an empty heading rather than as an error.
//
// They are also promises: a thing listed as shipped has to say when, and a
// release that claims to close a roadmap item has to name one that exists.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { byStage } from '../src/lib/progress/by-stage.ts';
import { LOCALES } from '../src/lib/i18n/locales.ts';
import { RELEASES } from '../src/lib/progress/releases.ts';
import { ROADMAP } from '../src/lib/progress/roadmap.ts';
import { STAGES } from '../src/lib/progress/stages.ts';

const blanks = (text: Readonly<Record<string, string>>): readonly string[] =>
  LOCALES.filter((lang) => (text[lang] ?? '').trim() === '');

describe('the roadmap', () => {
  test('says every item in every language', () => {
    const missing = ROADMAP.flatMap((item) =>
      [...blanks(item.title), ...blanks(item.note)].map((lang) => `${item.id}:${lang}`),
    );
    assert.deepEqual(missing, []);
  });

  test('names each item once', () => {
    const ids = ROADMAP.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('dates what it calls shipped, and nothing else', () => {
    const wrong = ROADMAP.filter((item) => (item.stage === 'done') !== (item.shipped !== undefined));
    assert.deepEqual(wrong.map((item) => item.id), []);
  });

  test('groups by stage in the order a reader wants: the present first', () => {
    const groups = byStage(ROADMAP);
    assert.deepEqual(groups.map((group) => group.stage), STAGES);
    assert.equal(groups.flatMap((group) => group.items).length, ROADMAP.length);
  });

  test('lists what shipped newest first', () => {
    const shipped = byStage(ROADMAP).find((group) => group.stage === 'done')?.items ?? [];
    const dates = shipped.map((item) => item.shipped ?? '');
    assert.deepEqual(dates, [...dates].sort().reverse());
  });
});

describe('the release notes', () => {
  test('say every release in every language', () => {
    const missing = RELEASES.flatMap((release) =>
      [...blanks(release.title), ...blanks(release.body)].map((lang) => `${release.date}:${lang}`),
    );
    assert.deepEqual(missing, []);
  });

  test('run newest first', () => {
    const dates = RELEASES.map((release) => release.date);
    assert.deepEqual(dates, [...dates].sort().reverse());
  });

  test('point only at roadmap items that exist', () => {
    const ids = new Set(ROADMAP.map((item) => item.id));
    const lost = RELEASES.filter((release) => release.roadmap !== undefined && !ids.has(release.roadmap));
    assert.deepEqual(lost.map((release) => release.date), []);
  });

  test('show an example that lives on this site', () => {
    const outside = RELEASES.filter((release) => !release.example.startsWith('/'));
    assert.deepEqual(outside.map((release) => release.date), []);
  });
});

describe('a date as a reader writes it', () => {
  test('is written the way each language writes a date', async () => {
    const { longDate } = await import('../src/lib/progress/long-date.ts');
    assert.equal(longDate('en', '2026-10-04'), '4 October 2026');
    assert.equal(longDate('it', '2026-10-04'), '4 ottobre 2026');
    // Russian declines the month after a day number; a month taken from a list
    // of names comes out in the nominative, which reads as a typo.
    assert.match(longDate('ru', '2026-10-04'), /^4 октября 2026/);
  });

  test('does not slide a day back in a timezone west of Rome', async () => {
    const { longDate } = await import('../src/lib/progress/long-date.ts');
    assert.equal(longDate('en', '2026-01-01'), '1 January 2026');
  });
});
