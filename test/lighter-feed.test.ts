// A region's feed is several hundred cards, and each used to carry its own
// copy of every glyph on it: a heart, a pin, a symbol per category — two
// thousand drawings, a third of the page and nearly half of its elements, to
// say the same sixteen things. The drawings are now on the page once, and a
// card points at them.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { CATEGORIES } from '../src/lib/events/categories.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import { feedCardHtml } from '../src/components/feed/feed-card-html.ts';
import { feedIcons } from '../src/lib/icons/feed-icons.ts';
import { feedSprite } from '../src/lib/icons/feed-sprite.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { FeedContext } from '../src/components/feed/feed-context.ts';

const context: FeedContext = { lang: 'en', ui: DEFAULT_PAGE_DATA.ui, icons: feedIcons(), today: '2026-10-07' };
const event: CompactEvent = { id: 'abc123abc123', t: 'Concert', s: '2026-11-01', c: ['music', 'family'], u: '', v: 'Teatro', img: 'https://x.example/a.jpg' };
const card = feedCardHtml(context, event);
const sprite = feedSprite();
const pointedAt = (html: string): readonly string[] => [...html.matchAll(/<use href="#([a-z0-9-]+)"/g)].map((match) => match[1] ?? '');
const drawn = (html: string): readonly string[] => [...html.matchAll(/<symbol id="([a-z0-9-]+)"/g)].map((match) => match[1] ?? '');

describe('a feed card', () => {
  test('carries no drawing of its own', () => {
    assert.equal(/<path|<circle|<rect|<line|<polyline|<polygon/.test(card), false);
  });
  test('points at a glyph for the heart, each category and the place', () => {
    assert.deepEqual(pointedAt(card), ['ic-heart', 'ic-music', 'ic-family', 'ic-pin']);
  });
  test('still hides every glyph from a screen reader', () => {
    assert.equal((card.match(/<svg/g) ?? []).length, (card.match(/<svg[^>]*aria-hidden="true"/g) ?? []).length);
  });
});

describe('the sprite a feed page carries once', () => {
  test('draws every category, the pin and the heart, each under its own name', () => {
    const names = drawn(sprite);
    assert.deepEqual([...names].sort(), [...CATEGORIES.map((category) => `ic-${category}`), 'ic-heart', 'ic-pin'].sort());
    assert.equal(new Set(names).size, names.length);
  });
  test('draws everything a card can point at', () => {
    const every: CompactEvent = { ...event, c: [...CATEGORIES].slice(0, 3) };
    const names = new Set(drawn(sprite));
    assert.deepEqual(pointedAt(feedCardHtml(context, every)).filter((name) => !names.has(name)), []);
  });
  test('takes no room on the page and says nothing to a screen reader', () => {
    assert.match(sprite, /^<svg[^>]*width="0"[^>]*height="0"[^>]*aria-hidden="true"/);
  });
});
