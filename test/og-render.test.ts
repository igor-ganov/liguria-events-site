// The card as pixels. Everything else about fonts is text; this is the only
// place that finds out whether the renderer agreed. It runs resvg the way the
// worker does, minus the worker's deploy-time bound wasm module.
import { describe, test, beforeAll } from 'bun:test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { CARD_FAMILIES } from '../src/lib/og/card-families.ts';
import { cardFonts } from '../src/lib/og/card-fonts.ts';
import { ogCardSvg } from '../src/lib/og/og-card-svg.ts';

beforeAll(async () => {
  const wasm = await readFile('node_modules/@resvg/resvg-wasm/index_bg.wasm');
  await initWasm(new Uint8Array(wasm));
});

const drawn = (title: string, fonts: readonly ArrayBuffer[]): number =>
  new Resvg(ogCardSvg({ title, when: '05.12 · 19:30', place: 'Palazzo Spinola', madeHere: true }), {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontBuffers: fonts.map((face) => new Uint8Array(face)),
      defaultFontFamily: CARD_FAMILIES.text,
      loadSystemFonts: false,
    },
  }).render().asPng().byteLength;

const LATIN = 'Concerto in cortile a lume di candela';
const CYRILLIC = 'Концерт во дворе при свечах';
const serif = (): readonly ArrayBuffer[] => [cardFonts()[0] ?? new ArrayBuffer(0)];
const sans = (): readonly ArrayBuffer[] => [cardFonts()[1] ?? new ArrayBuffer(0)];

describe('the card as drawn', () => {
  test('the title is set in the serif, not in whatever else was loaded', () => {
    // Handing a face over is not the same as using it: with the family named
    // loosely the renderer fell back to the sans and drew an identical card.
    assert.notEqual(drawn(LATIN, cardFonts()), drawn(LATIN, sans()));
  });

  test('a Russian title is drawn, not dropped', () => {
    // The serif has no Cyrillic; the sans beside it does, and the renderer is
    // expected to reach for it glyph by glyph. A missing glyph is not blank —
    // a box is drawn for it — so the measure is ink against the same card
    // without the fallback face, and against the same card with no title.
    const both = drawn(CYRILLIC, cardFonts());
    assert.ok(both > drawn(CYRILLIC, serif()) * 1.25, 'Cyrillic fell back to boxes');
    assert.ok(both > drawn('', cardFonts()) * 1.4, 'the title left no ink');
  });

  test('the date and the venue stay in the sans', () => {
    // The other half of the same mistake: name the sans in a way the renderer
    // cannot match and every line on the card silently becomes the serif.
    assert.notEqual(drawn('', cardFonts()), drawn('', serif()));
  });

  test('an Italian title keeps its accents', () => {
    assert.notEqual(drawn('Perchè a Genova', cardFonts()), drawn('Perche a Genova', cardFonts()));
  });
});
