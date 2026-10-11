// The days a feed keeps folded are taken out of the page after the build and
// put in a file of their own: the page a reader waits for is the days they
// see, and the rest is fetched behind it.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { splitFeedTail } from '../src/lib/feed/split-feed-tail.ts';

const TAIL = '<section class="feed-group" data-day="2026-10-12"><ul><li data-id="a">A</li></ul></section>';
const page = (tail: string): string => `<main><section data-day="2026-10-10"></section><template data-feed-tail>${tail}</template><span data-feed-more></span></main>`;

describe('splitFeedTail', () => {
  test('a page without folded days is left as it is', () => {
    assert.equal(splitFeedTail('<main><p>nothing folded</p></main>', () => '/t.html'), undefined);
  });
  test('the folded days leave the page, which says where they went', () => {
    const split = splitFeedTail(page(TAIL), () => '/data/tails/abc.html');
    assert.equal(split?.tail, TAIL);
    assert.ok(split?.page.includes('<template data-feed-tail data-src="/data/tails/abc.html"></template>'));
    assert.ok(!split?.page.includes('data-day="2026-10-12"'));
    // Everything around the fold is untouched.
    assert.ok(split?.page.startsWith('<main><section data-day="2026-10-10"></section>'));
    assert.ok(split?.page.endsWith('<span data-feed-more></span></main>'));
  });
  test('the browser is told to fetch them when it has nothing better to do', () => {
    const split = splitFeedTail(page(TAIL), () => '/data/tails/abc.html');
    assert.ok(split?.page.includes('<link rel="prefetch" href="/data/tails/abc.html">'));
  });
  test('the address is made from what is folded, so the same days share a file', () => {
    const seen: string[] = [];
    splitFeedTail(page(TAIL), (tail) => `${seen.push(tail)}`);
    assert.deepEqual(seen, [TAIL]);
  });
});
