import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { descriptionArticleHtml } from '../src/lib/description/description-article-html.ts';
import { descriptionPlain } from '../src/lib/description/description-plain.ts';

const md = [
  'A candlelit concert at Villa Borzino, worth attending for its rare violin.',
  '',
  '## [programme] Programme',
  '- Beethoven, Romance in F',
  '- Kreisler, Liebesleid',
  '',
  '## [tickets] Tickets',
  'Free donation to **Musicamica**.',
].join('\n');

describe('descriptionArticleHtml', () => {
  test('renders lead, typed sections with icons, and bullet lists', () => {
    const html = descriptionArticleHtml(md);
    assert.ok(html.includes('<div class="desc-lead"><p>A candlelit concert at Villa Borzino'));
    // The type tag drives the section type + icon and is stripped from the label.
    assert.ok(html.includes('<section class="desc-sec" data-sec="programme">'));
    assert.ok(html.includes('<span class="desc-h-tx">Programme</span>'));
    assert.ok(html.includes('<svg'), 'section icon rendered');
    assert.ok(html.includes('<ul class="desc-list"><li>Beethoven, Romance in F</li>'));
    assert.ok(html.includes('<section class="desc-sec" data-sec="tickets">'));
    assert.ok(html.includes('<strong>Musicamica</strong>'));
  });

  test('a heading with no type tag falls back to a neutral info section', () => {
    const html = descriptionArticleHtml('Lead.\n\n## Extra notes\nSomething.');
    assert.ok(html.includes('data-sec="info"'));
    assert.ok(html.includes('<span class="desc-h-tx">Extra notes</span>'));
  });

  test('escapes HTML so source text cannot inject markup', () => {
    const html = descriptionArticleHtml('Visit <script>alert(1)</script> now');
    assert.ok(!html.includes('<script>alert'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('a whole-line bold label is treated as a section heading', () => {
    const html = descriptionArticleHtml('Lead.\n\n**[getting-there] Getting there**\nVilla Borzino.');
    assert.ok(html.includes('data-sec="getting-there"'));
    assert.ok(html.includes('<span class="desc-h-tx">Getting there</span>'));
  });

  test('a plain description (no headings) renders as the lead only', () => {
    const html = descriptionArticleHtml('Just one sentence.');
    assert.equal(html, '<div class="event-article"><div class="desc-lead"><p>Just one sentence.</p></div></div>');
  });
});

describe('descriptionPlain', () => {
  test('strips headings, type tags, bullets and bold to one line', () => {
    const plain = descriptionPlain(md);
    assert.ok(!plain.includes('##'));
    assert.ok(!plain.includes('**'));
    assert.ok(!plain.includes('[programme]'));
    assert.ok(!plain.includes('- '));
    assert.ok(plain.includes('Programme Beethoven, Romance in F'));
    assert.ok(plain.includes('Musicamica'));
  });
});
