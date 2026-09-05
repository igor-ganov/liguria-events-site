// How a page says "you are looking at a stored copy".
//
// Not `navigator.onLine`: measured on 2026-09-05, Chromium keeps reporting
// true with the network cut out from under it, and in the field it means "this
// device is attached to a network", which is not the same as "the site
// answered". The truthful signal is the one the worker has — it either fetched
// this page or it took it out of storage — so the worker writes that onto the
// document it serves, and the page reads it back synchronously.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { FROM_CACHE_ATTRIBUTE } from '../src/sw/from-cache-attribute.ts';
import { markedFromCache } from '../src/sw/marked-from-cache.ts';

const PAGE = '<!doctype html>\n<html lang="en" data-theme="dark">\n<body>hello</body>\n</html>';

describe('markedFromCache', () => {
  test('writes the moment it was stored onto the document element', () => {
    const marked = markedFromCache(PAGE, 1788611934513);
    assert.ok(marked.includes(`${FROM_CACHE_ATTRIBUTE}="1788611934513"`), marked.slice(0, 120));
  });

  test('keeps everything the tag already said', () => {
    const marked = markedFromCache(PAGE, 1);
    assert.ok(marked.includes('lang="en"'));
    assert.ok(marked.includes('data-theme="dark"'));
    assert.ok(marked.includes('<body>hello</body>'));
  });

  test('marks the document element and nothing else that looks like it', () => {
    const nested = '<html><body><code>&lt;html&gt;</code><p>html</p></body></html>';
    const marked = markedFromCache(nested, 7);
    assert.equal(marked.split(FROM_CACHE_ATTRIBUTE).length - 1, 1);
  });

  test('html this worker does not recognise is handed back untouched', () => {
    // A cached copy that is not a document is not a page to mark, and half a
    // rewrite is worse than none.
    assert.equal(markedFromCache('{"events":[]}', 1), '{"events":[]}');
  });
});
