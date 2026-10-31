// The holiday the AI job picks: decoded at the boundary, active only inside its
// window, and allowed to recolour the site only with a colour that still reads.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Effect } from 'effect';
import { decodeHolidaysPayload } from '../src/lib/holidays/decode-holidays.ts';
import { upcomingHolidays } from '../src/lib/holidays/upcoming-holidays.ts';
import { holidayDress } from '../src/lib/holidays/holiday-dress.ts';
import { holidayAccent } from '../src/lib/holidays/holiday-accent.ts';
import { holidayRootAttrs } from '../src/lib/holidays/holiday-root-attrs.ts';
import { pillImages } from '../src/lib/holidays/pill-images.ts';
import { MOTIFS } from '../src/lib/holidays/motifs.ts';
import { MOTIF_PATHS } from '../src/lib/holidays/motif-paths.ts';
import { DARK_SURFACES } from '../src/lib/holidays/dark-surfaces.ts';
import { LIGHT_SURFACES } from '../src/lib/holidays/light-surfaces.ts';
import { loadHolidays } from '../src/data/load-holidays.ts';
import { contrastRatio } from '../src/lib/a11y/contrast-ratio.ts';
import fixture from '../e2e/fixtures/holidays.json';
import type { Holiday } from '../src/lib/holidays/decode-holidays.ts';

const holiday = (over: Partial<Holiday> = {}): Holiday => ({
  id: 'halloween',
  name: { en: 'Halloween', it: 'Halloween', ru: 'Halloween' },
  themeFrom: '2026-10-30',
  themeTo: '2026-10-31',
  theme: { accent: '#a34a00', accentDark: '#ff9f45', motif: 'pumpkin' },
  events: ['e1'],
  ...over,
});

const dataUrl = (text: string): string => `data:application/json,${encodeURIComponent(text)}`;
const EMPTY = { generatedAt: '', holidays: [] };

describe('decodeHolidaysPayload', () => {
  test('accepts the contract the collector publishes', () => {
    const decoded = Effect.runSync(decodeHolidaysPayload(fixture));
    assert.equal(decoded.holidays[0]?.theme.motif, 'pumpkin');
  });
  test('rejects a motif outside the fixed set — the model never supplies a drawing', () => {
    const bad = { generatedAt: 'x', holidays: [{ ...holiday(), theme: { ...holiday().theme, motif: 'skull' } }] };
    assert.equal(Effect.runSync(Effect.either(decodeHolidaysPayload(bad)))._tag, 'Left');
  });
});

describe('loadHolidays', () => {
  test('a payload that is not JSON means no holiday, not a broken build', async () => {
    assert.deepEqual(await loadHolidays(dataUrl('{oops')), EMPTY);
  });
  test('a payload of the wrong shape means no holiday', async () => {
    assert.deepEqual(await loadHolidays(dataUrl('{"holidays":"soon"}')), EMPTY);
  });
  test('an endpoint that is not there yet (404) means no holiday', async () => {
    const server = createServer((_, response) => response.writeHead(404).end('Not found'));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = [server.address()]
      .filter((address): address is AddressInfo => typeof address === 'object' && address !== null)
      .map((address) => address.port)
      .at(0);
    const loaded = await loadHolidays(`http://127.0.0.1:${port}/holidays.json`);
    server.close();
    assert.deepEqual(loaded, EMPTY);
  });
  test('a good payload comes through', async () => {
    assert.equal((await loadHolidays(dataUrl(JSON.stringify(fixture)))).holidays[0]?.id, 'halloween');
  });
});

describe('upcomingHolidays', () => {
  // A static page is built hours before it is read, so it carries the holidays
  // that have not ended yet and the browser picks the one of the day.
  test('keeps the ones that have not ended, the last day included', () => {
    const ids = upcomingHolidays([holiday(), holiday({ id: 'past', themeTo: '2026-10-29' })], '2026-10-31').map(({ id }) => id);
    assert.deepEqual(ids, ['halloween']);
  });
  test('soonest first, three at most', () => {
    const later = (id: string, from: string): Holiday => holiday({ id, themeFrom: from, themeTo: '2026-12-31' });
    const all = [later('d', '2026-12-20'), later('b', '2026-11-10'), holiday(), later('c', '2026-12-01')];
    assert.deepEqual(upcomingHolidays(all, '2026-10-31').map(({ id }) => id), ['halloween', 'b', 'c']);
  });
});

describe('holidayDress', () => {
  test('carries the window and the root attributes, worked out on the server', () => {
    assert.deepEqual(holidayDress(holiday()), {
      id: 'halloween',
      from: '2026-10-30',
      to: '2026-10-31',
      attrs: holidayRootAttrs(holiday()),
    });
  });
});

describe('holidayAccent', () => {
  test('keeps a colour that reads on every light surface', () => {
    assert.equal(holidayAccent('#A34A00', LIGHT_SURFACES), '#a34a00');
  });
  test('falls back when the value is not #rrggbb', () => {
    ['orange', '#fff', 'a34a00', '#a34a0', '#a34a00ff', 'url(x)', ''].forEach((value) =>
      assert.equal(holidayAccent(value, LIGHT_SURFACES), undefined, value),
    );
  });
  test('falls back when the colour does not reach 4.5:1', () => {
    assert.equal(holidayAccent('#ffff00', LIGHT_SURFACES), undefined);
    assert.equal(holidayAccent('#3a2a10', DARK_SURFACES), undefined);
  });
  test('whatever it keeps clears 4.5:1 against every surface', () => {
    ['#a34a00', '#6b2fa0', '#ff9f45', '#e0e0e0', '#888888', '#0a5c36', '#ffd166'].forEach((hex) =>
      [LIGHT_SURFACES, DARK_SURFACES].forEach((surfaces) =>
        [holidayAccent(hex, surfaces)]
          .filter((kept) => kept !== undefined)
          .forEach((kept) => surfaces.forEach((surface) => assert.ok(contrastRatio(kept ?? '', surface) >= 4.5))),
      ),
    );
  });
});

describe('holidayRootAttrs', () => {
  test('no holiday, no attributes — the page renders as it always has', () => {
    assert.deepEqual(holidayRootAttrs(undefined), {});
  });
  test('a valid holiday marks the root and carries both themes', () => {
    const attrs = holidayRootAttrs(holiday());
    assert.equal(attrs['data-holiday'], 'halloween');
    assert.equal(attrs['data-holiday-light'], '');
    assert.equal(attrs['data-holiday-dark'], '');
    assert.ok(attrs['style']?.includes('--holiday-light:#a34a00'));
    assert.ok(attrs['style']?.includes('--holiday-dark:#ff9f45'));
    assert.ok(attrs['style']?.includes(`--holiday-pill-light:${pillImages('#a34a00').fill}`));
  });
  test('a bad colour drops only its own theme', () => {
    const attrs = holidayRootAttrs(holiday({ theme: { accent: '#a34a00', accentDark: 'nope', motif: 'bat' } }));
    assert.equal(attrs['data-holiday-dark'], undefined);
    assert.equal(attrs['style']?.includes('--holiday-dark'), false);
  });
  test('two bad colours keep the motif and leave the colours alone', () => {
    const attrs = holidayRootAttrs(holiday({ theme: { accent: 'x', accentDark: 'y', motif: 'bat' } }));
    assert.deepEqual(attrs, { 'data-holiday': 'halloween' });
  });
});

describe('pillImages', () => {
  test('paint the hand-drawn pill in the given colour', () => {
    const { fill, ring } = pillImages('#a34a00');
    assert.ok(fill.startsWith('url("data:image/svg+xml;utf8,'));
    assert.ok(fill.includes("fill='%23a34a00'"));
    assert.ok(ring.includes("stroke='%23a34a00'"));
    assert.ok(ring.includes("fill='none'"));
  });
});

describe('MOTIF_PATHS', () => {
  test('every motif the job may pick has a drawing, and none has none', () => {
    MOTIFS.filter((motif) => motif !== 'none').forEach((motif) => assert.ok(MOTIF_PATHS[motif].length > 0, motif));
    assert.equal(MOTIF_PATHS.none.length, 0);
  });
});
