// The card that appears when somebody pastes an event link into a chat. Until
// now every event without a photo of its own got the same branded rectangle,
// which tells the reader nothing about what they are being invited to.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { ogCardSvg } from '../src/lib/og/og-card-svg.ts';
import { wrapLine } from '../src/lib/og/wrap-line.ts';
import { cardWhen } from '../src/lib/og/card-when.ts';

describe('wrapLine', () => {
  test('breaks on words, never inside one', () => {
    const lines = wrapLine('Concerto in cortile a lume di candela', 18);
    assert.ok(lines.every((line) => line.length <= 18), lines.join(' | '));
    assert.equal(lines.join(' '), 'Concerto in cortile a lume di candela');
  });

  test('a word longer than the line is allowed to overflow rather than vanish', () => {
    const lines = wrapLine('Kunsthistorischesmuseum', 10);
    assert.deepEqual(lines, ['Kunsthistorischesmuseum']);
  });

  test('stops after the lines asked for, and marks the cut', () => {
    const lines = wrapLine('one two three four five six seven eight nine ten', 9, 2);
    assert.equal(lines.length, 2);
    assert.ok(lines[1]?.endsWith('…'), lines.join(' | '));
  });

  test('nothing in, nothing out', () => {
    assert.deepEqual(wrapLine('   ', 20), []);
  });
});

describe('ogCardSvg', () => {
  const card = { title: 'Concerto in cortile', when: 'gio 27 agosto, 19:30', place: 'Palazzo Spinola', madeHere: true };

  test('carries what the reader needs to decide: what, when, where', () => {
    const svg = ogCardSvg(card);
    assert.ok(svg.includes('Concerto in cortile'));
    assert.ok(svg.includes('gio 27 agosto, 19:30'));
    assert.ok(svg.includes('Palazzo Spinola'));
  });

  test('is the size a link preview is cropped to', () => {
    const svg = ogCardSvg(card);
    assert.ok(svg.includes('width="1200"'));
    assert.ok(svg.includes('height="630"'));
  });

  test('markup in a title cannot break out of the drawing', () => {
    // The title is whatever its author typed.
    const svg = ogCardSvg({ ...card, title: 'Rock & <script>alert(1)</script>' });
    assert.ok(!svg.includes('<script>'));
    assert.ok(svg.includes('&amp;'));
  });

  test('an event made here is marked as such, and one found elsewhere is not', () => {
    assert.notEqual(ogCardSvg(card), ogCardSvg({ ...card, madeHere: false }));
  });

  test('a very long title is wrapped rather than run off the card', () => {
    const svg = ogCardSvg({ ...card, title: 'A'.repeat(40) + ' and then some more words here' });
    assert.ok(svg.split('<text').length > 3);
  });
});

describe('cardWhen', () => {
  test('gives the date and time, and leaves the place to its own line', () => {
    // The feed's formatter appends the venue, which put it on the card twice.
    const event = { id: 'a', t: 'x', s: '2026-12-05', h: '19:30', v: 'Palazzo Spinola', c: [] };
    assert.equal(cardWhen(event as never), '05.12 · 19:30');
  });

  test('a run of days is a span', () => {
    assert.equal(cardWhen({ s: '2026-12-05', e: '2026-12-07' } as never), '05.12–07.12');
  });
});
