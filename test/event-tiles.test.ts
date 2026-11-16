// The event page as edge-to-edge tiles: the pure parts behind them — which
// other events' photographs dress a tile, how they are dealt out, the week a
// single date sits in, and the colours every word on a tile is read against.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { blend } from '../src/lib/a11y/blend.ts';
import { contrastRatio } from '../src/lib/a11y/contrast-ratio.ts';
import { paletteOf } from '../src/lib/a11y/palette-of.ts';
import { collagePool } from '../src/lib/events/tiles/collage-pool.ts';
import { dealCollage } from '../src/lib/events/tiles/deal-collage.ts';
import { dayWeek } from '../src/lib/events/tiles/day-week.ts';
import { fabMove } from '../src/components/menu/fab-move.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (id: string, over: Partial<CompactEvent> = {}): CompactEvent => ({
  id,
  t: id,
  s: '2026-11-15',
  c: ['music'],
  u: `https://example.test/${id}`,
  rg: 'liguria',
  ct: 'genova',
  ...over,
});

const HERE = event('here', { img: 'https://example.test/here.jpg' });
const pictured = (id: string, over: Partial<CompactEvent> = {}): CompactEvent =>
  event(id, { img: `https://example.test/${id}.jpg`, ...over });

describe('collagePool', () => {
  const others = Array.from({ length: 8 }, (_, index) => pictured(`e${index}`));

  test('never takes the event itself, nor a picture equal to its own', () => {
    const twin = event('twin', { img: HERE.img });
    const pool = collagePool([HERE, twin, ...others], HERE, 20);
    expect(pool).not.toContain(HERE.img ?? '');
    expect(pool).toHaveLength(8);
  });

  test('prefers the thumbnail the corpus already carries', () => {
    const pool = collagePool([pictured('a', { th: 'https://example.test/a-thumb.jpg' })], HERE, 4);
    expect(pool).toEqual(['https://example.test/a-thumb.jpg']);
  });

  test('takes the town first, then the region, and never another region', () => {
    const near = pictured('near');
    const region = pictured('region', { ct: 'savona' });
    const away = pictured('away', { rg: 'lazio', ct: 'roma' });
    expect(collagePool([away, region, near], HERE, 4)).toEqual([near.img ?? '', region.img ?? '']);
  });

  test('is the same for the same event, and differs between events', () => {
    const first = collagePool(others, HERE, 4);
    expect(collagePool([...others].reverse(), HERE, 4)).toEqual(first);
    expect(collagePool(others, event('elsewhere'), 4)).not.toEqual(first);
  });

  test('skips events without a picture, and is empty when none has one', () => {
    expect(collagePool([event('bare')], HERE, 4)).toEqual([]);
  });
});

describe('dealCollage', () => {
  test('deals the pool out in order, a full hand to each tile', () => {
    expect(dealCollage(['a', 'b', 'c', 'd', 'e'], [2, 3])).toEqual([['a', 'b'], ['c', 'd', 'e']]);
  });

  test('leaves a tile plain rather than half dressed', () => {
    expect(dealCollage(['a', 'b', 'c'], [2, 3])).toEqual([['a', 'b'], []]);
    expect(dealCollage([], [2])).toEqual([[]]);
  });
});

describe('dayWeek', () => {
  test('a single date is its own week, the day filled', () => {
    const week = dayWeek(HERE, '2026-11-15', '2026-11-15');
    expect(week.month).toBe('2026-11');
    expect(week.weeks).toHaveLength(1);
    const days = (week.weeks[0] ?? []).map((cell) => (cell.kind === 'day' ? `${cell.day}:${cell.mark}` : '-'));
    expect(days).toEqual(['9:off', '10:off', '11:off', '12:off', '13:off', '14:off', '15:next']);
  });

  test('a span of days rings the ones still to come and crosses the gone', () => {
    const fair = event('fair', { s: '2026-11-10', e: '2026-11-12' });
    const days = (dayWeek(fair, '2026-11-11', '2026-11-11').weeks[0] ?? []).map((cell) => (cell.kind === 'day' ? cell.mark : '-'));
    expect(days).toEqual(['off', 'gone', 'next', 'on', 'off', 'off', 'off']);
  });

  test('a week that starts in the month before leaves those squares blank', () => {
    const cells = dayWeek(event('first', { s: '2026-12-01' }), '2026-12-01', '2026-11-15').weeks[0] ?? [];
    expect(cells.map((cell) => cell.kind)).toEqual(['blank', 'day', 'day', 'day', 'day', 'day', 'day']);
  });
});

// Every word on a tile is read against the tile's colour at its worst: a
// collage photograph that is white (multiply leaves the colour as it is) or
// lightens it (screen), and the brand outline laid over it.
const css = readFileSync('src/styles/filo-tokens.css', 'utf8');
const number = (name: string): number => Number(new RegExp(`--${name}:\\s*([0-9.]+);`).exec(css)?.[1] ?? 'NaN');
const channels = (hex: string): readonly number[] => [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
const screen = (top: string, bottom: string): string =>
  `#${channels(top)
    .map((value, index) => 255 - ((255 - value) * (255 - (channels(bottom)[index] ?? 0))) / 255)
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`;

for (const [name, selector] of [
  ['light', ':root'],
  ['dark', ":root[data-theme='dark']"],
] as const) {
  const palette = { ...paletteOf(css, ':root'), ...paletteOf(css, selector) };
  const mark = palette['tegola-segno'] ?? '';
  const outlined = (ground: string): string => blend(screen(mark, ground), number('tegola-segno-forza'), ground);
  const grounds = (ground: string, collage: string): readonly string[] => [ground, collage, outlined(ground), outlined(collage)];

  describe(`the tiles, ${name}`, () => {
    test('declare every colour they are painted in', () => {
      ['tegola-filo', 'tegola-notte', 'tegola-sosta', 'tegola-carta', 'su-tegola', 'tegola-segno'].forEach((token) => expect(palette[token]).toBeDefined());
    });

    test('white words read on the coloured tiles, under any collage and the outline', () => {
      const white = palette['su-tegola'] ?? '';
      const lit = (ground: string): string => blend('#ffffff', number('tegola-screen-forza'), ground);
      [
        ...grounds(palette['tegola-filo'] ?? '', palette['tegola-filo'] ?? ''),
        ...grounds(palette['tegola-sosta'] ?? '', palette['tegola-sosta'] ?? ''),
        ...grounds(palette['tegola-notte'] ?? '', lit(palette['tegola-notte'] ?? '')),
      ].forEach((ground) => expect(contrastRatio(white, ground)).toBeGreaterThanOrEqual(4.5));
    });

    test('the words on the paper tile read under its soft collage and the outline', () => {
      const paper = palette['tegola-carta'] ?? '';
      const soft = blend('#000000', number('tegola-soft-forza'), paper);
      grounds(paper, soft).forEach((ground) => expect(contrastRatio(palette['testo'] ?? '', ground)).toBeGreaterThanOrEqual(4.5));
    });
  });
}

describe('fabMove', () => {
  test('the menu button steps aside while the reader moves down through the page', () => {
    expect(fabMove({ previous: 200, current: 260, room: 900 })).toBe('away');
  });

  test('and comes back when they scroll up, at the top, and at the end', () => {
    expect(fabMove({ previous: 400, current: 380, room: 900 })).toBe('back');
    expect(fabMove({ previous: 10, current: 30, room: 900 })).toBe('back');
    expect(fabMove({ previous: 900, current: 960, room: 0 })).toBe('back');
  });

  test('and stays as it is when nothing moved', () => {
    expect(fabMove({ previous: 400, current: 400, room: 900 })).toBe('stay');
  });
});
