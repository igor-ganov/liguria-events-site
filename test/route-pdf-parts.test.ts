// Pure parts pulled out of src/components/favorites/route-pdf.ts — the file-name
// slug, the per-kind typography, the page-break decision and the jsPDF
// wrapped-text normalisation. No jsPDF and no DOM involved.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { pdfLineStyle } from '../src/components/favorites/pdf-line-style.ts';
import { pdfTextParts } from '../src/components/favorites/pdf-text-parts.ts';
import { placePdfLine } from '../src/components/favorites/place-pdf-line.ts';
import { routePdfSlug } from '../src/components/favorites/route-pdf-slug.ts';

describe('routePdfSlug', () => {
  test('reduces a title to a lower-case, dash-joined stem', () => {
    assert.equal(routePdfSlug('Genoa in 3 days'), 'genoa-in-3-days');
  });

  test('collapses runs of punctuation and accents and trims the edges', () => {
    assert.equal(routePdfSlug('  Café — Genova!!  '), 'caf-genova');
  });

  test('falls back to "route" when nothing usable survives', () => {
    assert.equal(routePdfSlug(''), 'route');
    assert.equal(routePdfSlug('###'), 'route');
  });

  test('caps the stem at 40 characters', () => {
    assert.equal(routePdfSlug('a'.repeat(45)), 'a'.repeat(40));
  });
});

describe('pdfLineStyle', () => {
  test('the title is the largest type and carries padding after it', () => {
    assert.deepEqual(pdfLineStyle('title'), { size: 20, gap: 30, indent: 0, before: 0, after: 6 });
  });

  test('a day heading is padded before it, so days breathe apart', () => {
    assert.equal(pdfLineStyle('day').before, 8);
    assert.equal(pdfLineStyle('day').after, 0);
  });

  test('legs and base legs are the small indented type', () => {
    assert.deepEqual(pdfLineStyle('leg'), { size: 9, gap: 14, indent: 16, before: 0, after: 0 });
    assert.deepEqual(pdfLineStyle('base'), pdfLineStyle('leg'));
  });

  test('a stop is unpadded body text at the margin', () => {
    assert.deepEqual(pdfLineStyle('stop'), { size: 11, gap: 17, indent: 0, before: 0, after: 0 });
  });
});

describe('placePdfLine', () => {
  test('stays on the page while the cursor is above the bottom margin', () => {
    assert.deepEqual(placePdfLine(100, 700, 48), { y: 100, newPage: false });
  });

  test('the bottom margin itself still fits — the break is strictly past it', () => {
    assert.deepEqual(placePdfLine(700, 700, 48), { y: 700, newPage: false });
  });

  test('past the bottom margin it starts a page at the top margin', () => {
    assert.deepEqual(placePdfLine(701, 700, 48), { y: 48, newPage: true });
  });
});

describe('pdfTextParts', () => {
  test('a bare string is one line', () => {
    assert.deepEqual(pdfTextParts('Palazzo Ducale'), ['Palazzo Ducale']);
  });

  test('a wrapped string comes back as its lines, in order', () => {
    assert.deepEqual(pdfTextParts(['first', 'second']), ['first', 'second']);
  });

  test('nothing to draw for an empty list or a missing value', () => {
    assert.deepEqual(pdfTextParts([]), []);
    assert.deepEqual(pdfTextParts(undefined), []);
  });

  test('non-string entries are dropped rather than printed', () => {
    assert.deepEqual(pdfTextParts([1, 'kept', {}]), ['kept']);
  });
});
