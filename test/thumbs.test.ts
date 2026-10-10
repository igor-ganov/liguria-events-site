// A card shows a small copy of the cover kept on our own storage when one has
// been made, and the source's own file when it has not. The first cards of a
// page are fetched at once; the rest wait until they are scrolled to.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eagerPictures } from '../src/components/feed/eager-pictures.ts';
import { feedCardThumb } from '../src/components/feed/feed-card-thumb.ts';
import { thumbKey } from '../src/lib/img/thumb-key.ts';
import { thumbPath } from '../src/lib/img/thumb-path.ts';
import { withThumbs } from '../src/lib/img/with-thumbs.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SOURCE = 'https://www.mentelocale.it/repository/contenuti/horizontal/142197_half.jpg?rand=1';
const LARGE = 'https://www.mentelocale.it/repository/contenuti/horizontal/142197.jpg?rand=1';

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-07-04',
  c: ['music'],
  u: 'https://example.test/e1',
  ...over,
});

describe('thumbKey', () => {
  test('is sixteen hex digits, the same every time', () => {
    assert.match(thumbKey(SOURCE), /^[0-9a-f]{16}$/);
    assert.equal(thumbKey(SOURCE), thumbKey(SOURCE));
  });
  test('tells two addresses apart, down to one character', () => {
    assert.notEqual(thumbKey(SOURCE), thumbKey(LARGE));
    assert.notEqual(thumbKey(`${SOURCE}a`), thumbKey(`${SOURCE}b`));
  });
});

describe('withThumbs', () => {
  const made = new Set([thumbKey(LARGE)]);
  test('names the copy of the cover the card would have shown', () => {
    assert.equal(withThumbs(made)(event({ img: SOURCE })).th, thumbPath(thumbKey(LARGE)));
  });
  test('leaves alone an event whose copy has not been made', () => {
    assert.equal(withThumbs(made)(event({ img: 'https://www.visitgenoa.it/a.jpg' })).th, undefined);
  });
  test('leaves alone an event that came without a picture', () => {
    assert.deepEqual(withThumbs(made)(event()), event());
  });
});

describe('feedCardThumb', () => {
  test('shows our copy when there is one', () => {
    assert.match(feedCardThumb(event({ img: SOURCE, th: '/uploads/thumbs/abc.webp' })), /src="\/uploads\/thumbs\/abc\.webp"/);
  });
  test('shows the source file when there is none', () => {
    assert.ok(feedCardThumb(event({ img: SOURCE })).includes(`src="${LARGE}"`));
  });
});

describe('eagerPictures', () => {
  const card = '<a><img class="photo-card-pic" src="/a.webp" loading="lazy" decoding="async" /></a>';
  test('the first card is fetched at once and ahead of the others', () => {
    const html = eagerPictures(0)(card);
    assert.ok(html.includes('loading="eager" fetchpriority="high"'));
    assert.ok(!html.includes('loading="lazy"'));
  });
  test('the next few are fetched at once, without jumping the queue', () => {
    const html = eagerPictures(3)(card);
    assert.ok(html.includes('loading="eager"'));
    assert.ok(!html.includes('fetchpriority'));
  });
  test('a card further down waits until it is scrolled to', () => {
    assert.equal(eagerPictures(4)(card), card);
  });
});

describe('heroCount', () => {
  test('a feed with nothing in it opens with no highlight', async () => {
    const { heroCount } = await import('../src/lib/picks/hero-count.ts');
    assert.equal(heroCount([], '2026-07-04'), 0);
  });
  test('an event today is at least the highlight of the day', async () => {
    const { heroCount } = await import('../src/lib/picks/hero-count.ts');
    assert.ok(heroCount([event({ img: SOURCE })], '2026-07-04') >= 1);
  });
});
