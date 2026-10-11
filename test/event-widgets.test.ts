// The event page is built of widgets. What the event says in prose is cut into
// its sections, and a section that repeats a widget already on the page is
// folded into that widget or left out, so nothing is said twice.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { descriptionOutline } from '../src/lib/description/description-outline.ts';
import { eventWidgets } from '../src/lib/events/event-widgets.ts';
import { saysNoMore } from '../src/lib/events/says-no-more.ts';

const TEXT = [
  'A journey through **Ariosto**.',
  '',
  '## [programme] Programma',
  '- Thursday: the director',
  '- Friday: the moon',
  '',
  '## [getting-there] Come arrivare',
  'Teatro Ivo Chiesa, Piazza Borgo Pila, Genova',
  '',
  '## [when] Quando',
  'From the 1st to the 23rd',
  '',
  '## [tickets] Biglietti',
  'Free entry',
].join('\n');

const PLACE = ['Teatro Ivo Chiesa, Piazza Borgo Pila, Genova', 'genova'];

describe('descriptionOutline', () => {
  const outline = descriptionOutline(TEXT);
  test('what stands before the first heading is the lead', () => {
    assert.equal(outline.lead, '<p>A journey through <strong>Ariosto</strong>.</p>');
  });
  test('each heading opens a part with its kind, its name and its words', () => {
    assert.deepEqual(outline.parts.map((part) => [part.type, part.label]), [
      ['programme', 'Programma'],
      ['getting-there', 'Come arrivare'],
      ['when', 'Quando'],
      ['tickets', 'Biglietti'],
    ]);
    assert.equal(outline.parts[0]?.html, '<ul class="desc-list"><li>Thursday: the director</li><li>Friday: the moon</li></ul>');
    assert.equal(outline.parts[1]?.plain, 'Teatro Ivo Chiesa, Piazza Borgo Pila, Genova');
  });
  test('a text with no heading is all lead', () => {
    assert.deepEqual(descriptionOutline('Only this.'), { lead: '<p>Only this.</p>', parts: [] });
  });
  test('markup in the source stays text', () => {
    assert.equal(descriptionOutline('<b>x</b>').lead, '<p>&lt;b&gt;x&lt;/b&gt;</p>');
  });
});

describe('saysNoMore', () => {
  test('the address again, in other punctuation, says no more', () => {
    assert.equal(saysNoMore('Teatro Ivo Chiesa – Piazza Borgo Pila (Genova).', PLACE), true);
  });
  test('a way to get there says more', () => {
    assert.equal(saysNoMore('Teatro Ivo Chiesa. Bus 13 from Brignole station.', PLACE), false);
  });
  test('nothing at all says no more', () => {
    assert.equal(saysNoMore('', PLACE), true);
  });
});

describe('eventWidgets', () => {
  const { parts } = descriptionOutline(TEXT);
  const types = (list: readonly { type: string }[]): string[] => list.map((part) => part.type);
  test('with a calendar of dates the programme folds under it and the dates are not repeated', () => {
    const widgets = eventWidgets({ parts, dated: true, place: PLACE });
    assert.equal(widgets.programme?.type, 'programme');
    assert.deepEqual(types(widgets.cards), ['tickets']);
  });
  test('without one, the programme and the dates are cards of their own', () => {
    const widgets = eventWidgets({ parts, dated: false, place: PLACE });
    assert.equal(widgets.programme, undefined);
    assert.deepEqual(types(widgets.cards), ['programme', 'when', 'tickets']);
  });
  test('directions that repeat the address are left out; ones that add to it go under the map', () => {
    assert.equal(eventWidgets({ parts, dated: true, place: PLACE }).way, undefined);
    assert.equal(eventWidgets({ parts, dated: true, place: ['Elsewhere'] }).way?.type, 'getting-there');
  });
});
