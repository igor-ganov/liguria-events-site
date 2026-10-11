// A page is markup and style; its scripts wire what is already on screen. They
// are asked for after the things a first screen is made of, not alongside them.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { pageAfterPaint } from '../src/lib/html/page-after-paint.ts';
import { scriptsAfterPaint } from '../src/lib/html/scripts-after-paint.ts';

describe('scriptsAfterPaint', () => {
  test('a module the page links to is asked for at low priority', () => {
    assert.equal(
      scriptsAfterPaint('<script type="module" src="/_astro/a.js"></script>'),
      '<script type="module" fetchpriority="low" src="/_astro/a.js"></script>',
    );
  });
  test('every one of them, wherever it stands', () => {
    const page = '<head><script type="module" src="/a.js"></script></head><body><script type="module" src="/b.js"></script></body>';
    assert.equal(scriptsAfterPaint(page).split('fetchpriority="low"').length - 1, 2);
  });
  test('a script written into the page is left alone: there is nothing to fetch', () => {
    const inline = '<script type="module">start()</script><script>window.x=1</script>';
    assert.equal(scriptsAfterPaint(inline), inline);
  });
  test('doing it twice changes nothing more', () => {
    const once = scriptsAfterPaint('<script type="module" src="/a.js"></script>');
    assert.equal(scriptsAfterPaint(once), once);
  });
});

describe('pageAfterPaint', () => {
  test('a rendered page keeps its status and headers and gets the same treatment', async () => {
    const page = new Response('<script type="module" src="/a.js"></script>', { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'x-kept': 'yes' } });
    const answer = await pageAfterPaint(page);
    assert.equal(answer.status, 410);
    assert.equal(answer.headers.get('x-kept'), 'yes');
    assert.ok((await answer.text()).includes('fetchpriority="low"'));
  });
  test('what is not a page is handed on as it came', async () => {
    const data = Response.json({ script: '<script type="module" src="/a.js"></script>' });
    assert.equal(await pageAfterPaint(data), data);
  });
});
