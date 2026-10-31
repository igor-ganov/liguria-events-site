// The site's icon in the browser tab wears the holiday too: the pin takes the
// holiday's colour and carries its motif in place of the wave.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { holidayIcon } from '../src/lib/holidays/holiday-icon.ts';
import { holidayDress } from '../src/lib/holidays/holiday-dress.ts';
import { MOTIF_PATHS } from '../src/lib/holidays/motif-paths.ts';
import type { Holiday } from '../src/lib/holidays/decode-holidays.ts';

const holiday = (over: Partial<Holiday['theme']> = {}): Holiday => ({
  id: 'halloween',
  name: { en: 'Halloween', it: 'Halloween', ru: 'Halloween' },
  themeFrom: '2026-10-29',
  themeTo: '2026-10-31',
  theme: { accent: '#a34a00', accentDark: '#ff9f45', motif: 'pumpkin', ...over },
  events: [],
});

const svgOf = (uri: string): string => decodeURIComponent(uri.replace('data:image/svg+xml,', ''));

describe('the holiday icon', () => {
  test('is an SVG the browser can take as a tab icon without a request', () => {
    assert.match(holidayIcon(holiday()), /^data:image\/svg\+xml,/);
    assert.match(svgOf(holidayIcon(holiday())), /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  test('fills the pin with the holiday colour', () => {
    assert.ok(svgOf(holidayIcon(holiday())).includes('fill="#a34a00"'));
  });

  test('draws the holiday motif in place of the wave', () => {
    const svg = svgOf(holidayIcon(holiday()));
    MOTIF_PATHS.pumpkin.forEach((path) => assert.ok(svg.includes(path), path));
    assert.ok(!svg.includes('M8.2 16.4'));
  });

  test('keeps the site orange when the holiday colour does not read', () => {
    assert.ok(svgOf(holidayIcon(holiday({ accent: '#ffff00' }))).includes('fill="#f2822a"'));
  });

  test('keeps the wave when the holiday has no motif', () => {
    assert.ok(svgOf(holidayIcon(holiday({ motif: 'none' }))).includes('M8.2 16.4'));
  });

  test('travels with the rest of the holiday to the page', () => {
    assert.equal(holidayDress(holiday()).icon, holidayIcon(holiday()));
  });
});
