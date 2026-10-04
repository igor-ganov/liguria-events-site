// The feed card that is a photograph with words on it.
//
// Three things can go wrong quietly. The cover can be the thumbnail the source
// lists rather than the photograph it also serves, which is invisible in a
// 74-pixel square and a smear at full width. The words can sit on a picture
// that happens to be white. And the search, which reads the rendered cards,
// can lose the description the moment the card stops showing it.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { blend } from '../src/lib/a11y/blend.ts';
import { contrastRatio } from '../src/lib/a11y/contrast-ratio.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import { feedCardHtml } from '../src/components/feed/feed-card-html.ts';
import { largeCover } from '../src/lib/img/large-cover.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { FeedContext } from '../src/components/feed/feed-context.ts';

describe('largeCover', () => {
  test('asks mentelocale for the photograph, not its half-size thumbnail', () => {
    assert.equal(
      largeCover('https://www.mentelocale.it/repository/contenuti/horizontal/141086_half.jpg?rand=641285680'),
      'https://www.mentelocale.it/repository/contenuti/horizontal/141086.jpg?rand=641285680',
    );
  });

  test('does the same for genovateatro, which runs the same software', () => {
    assert.equal(
      largeCover('https://www.genovateatro.it/repository/eventi/square/2219_half.jpg'),
      'https://www.genovateatro.it/repository/eventi/square/2219.jpg',
    );
  });

  test('takes eventiesagre out of its thumb folder', () => {
    assert.equal(
      largeCover('https://www.eventiesagre.it/eventi/21146351/thumb/eventi_doc.jpg'),
      'https://www.eventiesagre.it/eventi/21146351/img/eventi_doc.jpg',
    );
  });

  test('leaves every other source exactly as it was', () => {
    const others = [
      'https://s1.ticketm.net/dam/a/2d5/1486fb7e_SOURCE',
      'https://www.visitgenoa.it/sites/default/files/styles/max_650x650/public/a.jpg?itok=x',
      'https://example.test/pictures/thumb/a_half.jpg',
    ];
    assert.deepEqual(others.map(largeCover), others);
  });

  test('does not rewrite a path that only resembles the pattern', () => {
    const url = 'https://www.mentelocale.it/repository/contenuti/horizontal/half_marathon.jpg';
    assert.equal(largeCover(url), url);
  });
});

const css = readFileSync('src/styles/filo-tokens.css', 'utf8');
const token = (name: string): string => new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim() ?? '';

describe('the veil under the words', () => {
  // The worst photograph for white text is a white one. The veil alone has to
  // carry the contrast there, at the strength it has where the words sit.
  test('keeps white text readable on a white photograph', () => {
    const veiled = blend(token('velo'), Number(token('velo-forza')), '#ffffff');
    assert.ok(contrastRatio('#ffffff', veiled) >= 4.5, `only ${contrastRatio('#ffffff', veiled).toFixed(2)}:1`);
  });

  test('is declared, so the number above is not a guess', () => {
    assert.match(token('velo'), /^#[0-9a-f]{6}$/);
    assert.ok(Number(token('velo-forza')) > 0.5);
  });
});

describe('blend', () => {
  test('is the top colour at full strength and the bottom one at none', () => {
    assert.equal(blend('#102030', 1, '#ffffff'), '#102030');
    assert.equal(blend('#102030', 0, '#ffffff'), '#ffffff');
  });

  test('meets in the middle at half', () => {
    assert.equal(blend('#000000', 0.5, '#ffffff'), '#808080');
  });
});

const context: FeedContext = { lang: 'en', ui: DEFAULT_PAGE_DATA.ui, icons: { music: '<svg id="music"/>' }, today: '2026-07-06' };
const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-07-04',
  c: ['music'],
  u: 'https://example.test/e1',
  ...over,
});

describe('the card built in the browser', () => {
  test('is a photo card carrying the large cover', () => {
    const html = feedCardHtml(context, event({ img: 'https://www.mentelocale.it/repository/contenuti/horizontal/1_half.jpg' }));
    assert.ok(html.startsWith('<a class="photo-card"'));
    assert.ok(html.includes('src="https://www.mentelocale.it/repository/contenuti/horizontal/1.jpg"'));
  });

  test('shows the hour large and the venue beside a pin', () => {
    const html = feedCardHtml(context, event({ h: '21:00', v: 'Porto Antico' }));
    assert.match(html, /<b>21:00<\/b>/);
    assert.match(html, /photo-card-venue[^>]*>.*Porto Antico/);
  });

  test('says nothing about an hour it does not know', () => {
    assert.ok(!feedCardHtml(context, event()).includes('<b></b>'));
  });

  test('keeps the description for the search without showing it', () => {
    const html = feedCardHtml(context, event({ d: { en: 'Brass on the pier', it: '', ru: '' } }));
    assert.match(html, /<p class="mini-desc" hidden>Brass on the pier<\/p>/);
  });

  test('keeps the title where the search looks for it', () => {
    assert.match(feedCardHtml(context, event()), /class="mini-title photo-card-title">Concerto</);
  });

  test('shows the mark of the site when the event came with no cover', () => {
    const html = feedCardHtml(context, event());
    assert.ok(html.includes('<span class="photo-card-blank"><svg class="brand-mark"'));
    assert.ok(!html.includes('<img'));
  });
});

describe('a card for something that starts several times a day', () => {
  test('shows the first hour large and the rest beside it', () => {
    const html = feedCardHtml(context, event({ h: '10:00', hs: ['10:00', '11:00', '14:20'] }));
    assert.match(html, /<b>10:00<\/b>/);
    assert.match(html, /photo-card-more[^>]*>11:00 · 14:20</);
  });

  test('shows nothing beside a single hour', () => {
    assert.ok(!feedCardHtml(context, event({ h: '10:00' })).includes('photo-card-more'));
  });
});
