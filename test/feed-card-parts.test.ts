// The markup the feed builds in the browser for an event published since the
// build — it must match the server-rendered card the filter and index read.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { feedCardAttrs } from '../src/components/feed/feed-card-attrs.ts';
import { feedCardTags } from '../src/components/feed/feed-card-tags.ts';
import { feedCardThumb } from '../src/components/feed/feed-card-thumb.ts';
import { feedCardHtml } from '../src/components/feed/feed-card-html.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { FeedContext } from '../src/components/feed/feed-context.ts';

const ui = DEFAULT_PAGE_DATA.ui;
const icons: Readonly<Record<string, string>> = { music: '<svg id="music"/>', art: '<svg id="art"/>' };

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-07-04',
  c: ['music'],
  u: 'https://example.test/e1',
  ...over,
});

const context: FeedContext = { lang: 'en', ui, icons, today: '2026-07-06' };

describe('feedCardAttrs', () => {
  test('carries what the filter and the sort read', () => {
    assert.deepEqual(feedCardAttrs(event({ e: '2026-07-06', c: ['music', 'art'], cr: 1750000000 })), {
      id: 'e1',
      cats: 'music,art',
      start: '2026-07-04',
      end: '2026-07-06',
      free: '0',
      gem: '0',
      created: '1750000000',
    });
  });
  test('a one-day event ends the day it starts', () => {
    assert.equal(feedCardAttrs(event()).end, '2026-07-04');
  });
  test('the flags are 1/0, never absent', () => {
    assert.equal(feedCardAttrs(event({ f: true, x: true })).free, '1');
    assert.equal(feedCardAttrs(event({ f: true, x: true })).gem, '1');
    assert.equal(feedCardAttrs(event({ f: false })).free, '0');
  });
  test('an event with no first-seen time stays unknown, not epoch zero', () => {
    assert.equal(feedCardAttrs(event()).created, '');
  });
  test('carries no city, so a city page hides a late event it cannot place', () => {
    assert.equal(feedCardAttrs(event({ ct: 'genova' }))['ct'], undefined);
  });
});

describe('feedCardThumb', () => {
  test('renders the cover when there is one', () => {
    const html = feedCardThumb(event({ img: 'https://img.test/a.jpg' }), icons);
    assert.ok(html.startsWith('<img class="mini-thumb"'));
    assert.ok(html.includes('src="https://img.test/a.jpg"'));
    assert.ok(html.includes('data-cat="music"'));
    assert.ok(html.includes('loading="lazy"'));
  });
  test('falls back to the category glyph', () => {
    assert.equal(
      feedCardThumb(event(), icons),
      '<div class="mini-thumb--empty" data-cat="music"><svg id="music"/></div>',
    );
  });
  test('a category with no glyph still renders its box', () => {
    assert.equal(
      feedCardThumb(event({ c: ['sport'] }), icons),
      '<div class="mini-thumb--empty" data-cat="sport"></div>',
    );
  });
  test('escapes the cover URL', () => {
    assert.ok(feedCardThumb(event({ img: 'a"onerror="x' }), icons).includes('a&quot;onerror=&quot;x'));
  });
});

describe('feedCardTags', () => {
  test('one chip per category, glyph and localized label', () => {
    assert.equal(
      feedCardTags(event({ c: ['music', 'art'] }), ui, icons),
      `<span class="cat-tag" data-cat="music"><svg id="music"/> ${ui.cat.music}</span>` +
        `<span class="cat-tag" data-cat="art"><svg id="art"/> ${ui.cat.art}</span>`,
    );
  });
  test('an event with no categories has no chips', () => {
    assert.equal(feedCardTags(event({ c: [] }), ui, icons), '');
  });
});

describe('feedCardHtml', () => {
  test('builds the mini-card the feed already renders', () => {
    const html = feedCardHtml(context, event({ d: { en: 'A night of jazz.', it: '', ru: '' } }));
    assert.ok(html.startsWith('<a class="mini-card" href="/event/e1/"'));
    assert.ok(html.includes('<h4 class="mini-title">Concerto</h4>'));
    assert.ok(html.includes('<span class="mini-when">'));
    assert.ok(html.includes('<p class="mini-desc">A night of jazz.</p>'));
    assert.ok(html.includes('<div class="mini-tags">'));
    assert.ok(html.endsWith('</div></div></a>'));
  });
  test('omits the description paragraph when the event has none', () => {
    assert.ok(!feedCardHtml(context, event()).includes('mini-desc'));
  });
  test('shows the free and gem badges only when flagged', () => {
    const plain = feedCardHtml(context, event());
    assert.ok(!plain.includes('badge-free'));
    assert.ok(!plain.includes('badge-gem'));
    const flagged = feedCardHtml(context, event({ f: true, x: true }));
    assert.ok(flagged.includes(`<span class="badge-free">${ui.badges.free}</span>`));
    assert.ok(flagged.includes(`<span class="badge-gem">${ui.badges.gem}</span>`));
  });
  test('a non-default locale links to its own page', () => {
    const html = feedCardHtml({ ...context, lang: 'it' }, event());
    assert.ok(html.includes('href="/it/event/e1/"'));
  });
  test('escapes the title, so data cannot inject markup', () => {
    const html = feedCardHtml(context, event({ t: 'Rock & <b>roll</b>' }));
    assert.ok(html.includes('Rock &amp; &lt;b&gt;roll&lt;/b&gt;'));
    assert.ok(!html.includes('<b>roll'));
  });
});
