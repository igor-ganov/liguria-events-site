import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { commonsImg } from '../src/lib/img/commons-img.ts';

// These pin the exact failure that shipped broken images: http:// (mixed
// content) and arbitrary /thumb/…/<N>px- widths that Wikimedia now 400s. The
// helper must always emit https + Special:FilePath?width=N for Wikimedia URLs.
describe('commonsImg', () => {
  test('Wikidata P18 http Special:FilePath → https, right width', () => {
    const out = commonsImg('http://commons.wikimedia.org/wiki/Special:FilePath/Foo.jpg?width=800', 96);
    assert.equal(out, 'https://commons.wikimedia.org/wiki/Special:FilePath/Foo.jpg?width=96');
  });

  test('Wikipedia upload /thumb/…/960px- → Special:FilePath at the wanted width', () => {
    const out = commonsImg(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/United_States_Mission.jpg/960px-United_States_Mission.jpg',
      240,
    );
    assert.equal(out, 'https://commons.wikimedia.org/wiki/Special:FilePath/United_States_Mission.jpg?width=240');
  });

  test('strips the pageimages ?utm_* query on upload thumbs', () => {
    const out = commonsImg(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Eremo_fuori.jpg/960px-Eremo_fuori.jpg?utm_source=it.wikipedia.org&utm_campaign=api',
      400,
    );
    assert.equal(out, 'https://commons.wikimedia.org/wiki/Special:FilePath/Eremo_fuori.jpg?width=400');
  });

  test('keeps URL-encoded file names intact', () => {
    const out = commonsImg('http://commons.wikimedia.org/wiki/Special:FilePath/Lupa_Capitolina%2C_Rome.jpg?width=800', 128);
    assert.equal(out, 'https://commons.wikimedia.org/wiki/Special:FilePath/Lupa_Capitolina%2C_Rome.jpg?width=128');
  });

  test('handles a full (non-thumb) upload URL', () => {
    const out = commonsImg('https://upload.wikimedia.org/wikipedia/commons/a/ab/Foo.jpg', 96);
    assert.equal(out, 'https://commons.wikimedia.org/wiki/Special:FilePath/Foo.jpg?width=96');
  });

  test('language-wiki upload (/wikipedia/it/…) targets that wiki, not commons', () => {
    const out = commonsImg(
      'https://upload.wikimedia.org/wikipedia/it/thumb/b/ba/Agguato_di_via_Fani.jpg/960px-Agguato_di_via_Fani.jpg?utm_source=it',
      96,
    );
    assert.equal(out, 'https://it.wikipedia.org/wiki/Special:FilePath/Agguato_di_via_Fani.jpg?width=96');
  });

  test('non-Wikimedia URL passes through, only http→https', () => {
    assert.equal(commonsImg('http://example.com/p.jpg', 96), 'https://example.com/p.jpg');
    assert.equal(commonsImg('https://cdn.event.it/cover.jpg', 96), 'https://cdn.event.it/cover.jpg');
  });

  test('output is never http and never a bucket-width /thumb/ URL', () => {
    for (const u of [
      'http://commons.wikimedia.org/wiki/Special:FilePath/A.jpg?width=800',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/B.jpg/960px-B.jpg',
    ]) {
      const out = commonsImg(u, 200);
      assert.ok(out.startsWith('https://'), out);
      assert.ok(!/\/\d+px-/.test(out), out);
    }
  });
});
