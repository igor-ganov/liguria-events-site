// The faces the link-preview card is drawn with. The card asks for a family by
// name and the renderer looks that name up in the faces it was handed: a name
// that does not match is not an error, it is a silent fall back to whatever
// else is loaded. That is how the title ended up set in the sans while the
// drawing said Fraunces, and how naming the sans loosely would now hand the
// date and the venue to the serif.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { CARD_FAMILIES } from '../src/lib/og/card-families.ts';
import { cardFonts } from '../src/lib/og/card-fonts.ts';
import { ogCardSvg } from '../src/lib/og/og-card-svg.ts';

const SFNT = 0x00010000;

// A face names itself in its `name` table, in UTF-16BE.
const names = (face: ArrayBuffer): string =>
  Buffer.from(new Uint8Array(face)).swap16().toString('utf16le');

const faces = cardFonts();

describe('cardFonts', () => {
  test('carries both faces the card draws with', () => {
    assert.equal(faces.length, 2);
  });

  test('each one is a real font, not a truncated blob', () => {
    faces.forEach((face) => assert.equal(new DataView(face).getUint32(0), SFNT));
  });

  test('the serif is Fraunces and the sans is Rubik', () => {
    assert.ok(names(faces[0] ?? new ArrayBuffer(0)).includes('Fraunces'));
    assert.ok(names(faces[1] ?? new ArrayBuffer(0)).includes('Rubik'));
  });
});

describe('CARD_FAMILIES', () => {
  test('names families that at least belong to the bundled faces', () => {
    // Only a sanity check: whether the renderer can match these names is a
    // question about the typographic family, and only rendering answers it —
    // test/og-render.test.ts.
    assert.ok(names(faces[0] ?? new ArrayBuffer(0)).includes(CARD_FAMILIES.title));
    assert.ok(names(faces[1] ?? new ArrayBuffer(0)).includes(CARD_FAMILIES.text));
  });

  test('the drawing asks for those families first, before any fallback', () => {
    const bundled: readonly string[] = [CARD_FAMILIES.title, CARD_FAMILIES.text];
    const card = ogCardSvg({ title: 'x', when: 'y', place: 'z', madeHere: true });
    const asked = [...card.matchAll(/font-family:([^;}]+)/g)].map(
      (m) => (m[1] ?? '').split(',')[0]?.replace(/'/g, '') ?? '',
    );
    assert.ok(asked.length >= 4);
    asked.forEach((family) => assert.ok(bundled.includes(family), family));
  });
});
