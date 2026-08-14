import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import {
  descriptionArticleHtml,
  descriptionPlain,
} from '../src/components/events/description-article.ts';

const md = [
  'A candlelit concert at Villa Borzino, worth attending for its rare violin.',
  '',
  '## Programme',
  '- Beethoven, Romance in F',
  '- Kreisler, Liebesleid',
  '',
  '## Tickets',
  'Free donation to **Musicamica**.',
].join('\n');

describe('descriptionArticleHtml', () => {
  test('renders a lead paragraph, section headings and bullet lists', () => {
    const html = descriptionArticleHtml(md);
    assert.ok(html.includes('<p>A candlelit concert at Villa Borzino'));
    assert.ok(html.includes('<h3 class="desc-h">Programme</h3>'));
    assert.ok(html.includes('<ul><li>Beethoven, Romance in F</li>'));
    assert.ok(html.includes('<h3 class="desc-h">Tickets</h3>'));
    assert.ok(html.includes('<strong>Musicamica</strong>'));
  });

  test('escapes HTML so source text cannot inject markup', () => {
    const html = descriptionArticleHtml('Visit <script>alert(1)</script> now');
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('a whole-line bold label is treated as a section heading', () => {
    const html = descriptionArticleHtml('Lead.\n\n**Getting there**\nVilla Borzino, Busalla.');
    assert.ok(html.includes('<h3 class="desc-h">Getting there</h3>'));
  });

  test('plain descriptions (no markdown) still render as a paragraph', () => {
    assert.equal(descriptionArticleHtml('Just one sentence.'), '<p>Just one sentence.</p>');
  });
});

describe('descriptionPlain', () => {
  test('strips headings, bullets and bold markers to one line', () => {
    const plain = descriptionPlain(md);
    assert.ok(!plain.includes('##'));
    assert.ok(!plain.includes('**'));
    assert.ok(!plain.includes('- '));
    assert.ok(plain.includes('Programme Beethoven, Romance in F'));
    assert.ok(plain.includes('Musicamica'));
  });
});
