// The interface draws its arrows, crosses, ticks and transport modes with SVG
// icons (src/lib/icons). A Unicode stand-in — ✕, ↗, ▾, 🚌 — renders in
// whatever font the device happens to have: a different size and weight on
// every phone, an emoji in colour that ignores the theme, and on some systems
// a box. This guard keeps them from creeping back.
//
// It reads three things: the UI dictionaries, every template and script under
// src (comments stripped — prose in a comment is not shown to anybody), and,
// when a build is present, the HTML of the key pages the way a reader receives it.
//
// Typographic punctuation (— – · « » … „ “ ’ ′) is text, not an icon, and is
// left alone. Scraped data (src/data) is not ours to rewrite.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BANNED_GLYPHS } from '../e2e/kit/banned-glyphs.ts';

const BANNED = BANNED_GLYPHS;

// The event page is being rebuilt on branch `ux/event-tiles`, which brings its
// own icons; its folder joins this guard when that branch lands.
const NOT_YET = ['src/components/views/event/'];
const NOT_OURS = ['src/data/', 'src/lib/search/README.md'];

const SOURCES = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .map((path) => `src/${path.replaceAll('\\', '/')}`)
  .filter((path) => /\.(ts|astro|css|md)$/.test(path))
  .filter((path) => ![...NOT_YET, ...NOT_OURS].some((skip) => path.startsWith(skip)));

/** The file with its comments blanked out: block, JSDoc, HTML, and line
 *  comments (a `//` after a colon is a URL, not a comment). */
const withoutComments = (text: string): string =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');

/** `line: text` for every line still carrying a banned glyph. */
const offenders = (text: string): readonly string[] =>
  text
    .split('\n')
    .map((line, index) => `${index + 1}: ${line.trim().slice(0, 120)}`)
    .filter((line) => BANNED.test(line));

describe('no Unicode glyph stands in for an icon', () => {
  test('the guard recognises what it is guarding against', () => {
    ['✕', '×', '↗', '←', '▾', '⏸', '⚠', '🚌', '🏠', '⠿', '‹'].forEach((glyph) => assert.match(glyph, BANNED));
    ['—', '–', '·', '«', '»', '…', '„', '“', '’', '′'].forEach((mark) => assert.doesNotMatch(mark, BANNED));
  });

  test('the UI dictionaries hold none', () => {
    const dictionaries = SOURCES.filter((path) => path.startsWith('src/content/ui/'));
    assert.equal(dictionaries.length, 3);
    dictionaries.forEach((path) => assert.deepEqual(offenders(readFileSync(path, 'utf8')), [], path));
  });

  test('no template or script under src writes one', () => {
    const found = SOURCES.flatMap((path) =>
      offenders(withoutComments(readFileSync(path, 'utf8'))).map((line) => `${path}:${line}`),
    );
    assert.deepEqual(found, []);
  });
});

// Scripts and inline styles are stripped: a script's text is not on screen, and
// what it does write is covered by the source scan above.
const visible = (html: string): string =>
  html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '');

// The prerendered ones. The quick pages (tonight, this weekend), place and
// landmark pages and the 404 are rendered by the worker on request, so there is
// no file to read; their templates are covered by the source scan.
const PAGES = [
  'en/liguria/index.html',
  'it/liguria/index.html',
  'ru/liguria/index.html',
  'en/liguria/map/index.html',
  'en/liguria/calendar/index.html',
  'en/liguria/places/index.html',
  'en/liguria/landmarks/index.html',
  'en/favorites/index.html',
  'en/index.html',
].map((page) => join('dist', page));

describe('the built key pages', () => {
  test.skipIf(!existsSync(join('dist', 'en', 'liguria', 'index.html')))('show none (run after a build)', () => {
    assert.deepEqual(PAGES.filter((path) => !existsSync(path)), [], 'a key page is missing from the build');
    const found = PAGES.flatMap((path) =>
      [...visible(readFileSync(path, 'utf8')).matchAll(new RegExp(`.{0,40}${BANNED.source}.{0,20}`, 'gu'))].map(
        (match) => `${path}: ${match[0]}`,
      ),
    );
    assert.deepEqual(found, []);
  });
});
