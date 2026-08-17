// The pure pieces descriptionArticleHtml is assembled from (line tokens, the
// block fold, section splitting/heading tags and the two renderers).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { escapeDescriptionHtml } from '../src/lib/description/escape-description-html.ts';
import { inlineBold } from '../src/lib/description/inline-bold.ts';
import { descriptionLineToken } from '../src/lib/description/description-line-token.ts';
import { parseDescriptionBlocks } from '../src/lib/description/parse-description-blocks.ts';
import { renderDescriptionBody } from '../src/lib/description/render-description-body.ts';
import { parseSectionHead } from '../src/lib/description/parse-section-head.ts';
import { splitDescriptionSections } from '../src/lib/description/split-description-sections.ts';
import { renderDescriptionSection } from '../src/lib/description/render-description-section.ts';
import type { DescriptionBlock } from '../src/lib/description/description-block.ts';

describe('escapeDescriptionHtml', () => {
  test('escapes the three characters that can open a tag or entity', () => {
    assert.equal(escapeDescriptionHtml('<b>a & b</b>'), '&lt;b&gt;a &amp; b&lt;/b&gt;');
  });
  test('escapes the ampersand first, so entities are not double-built', () => {
    assert.equal(escapeDescriptionHtml('&lt;'), '&amp;lt;');
  });
  test('leaves ordinary text and Markdown markers untouched', () => {
    assert.equal(escapeDescriptionHtml('## [tickets] **Free**'), '## [tickets] **Free**');
  });
});

describe('inlineBold', () => {
  test('turns paired markers into strong', () => {
    assert.equal(inlineBold('a **b** c'), 'a <strong>b</strong> c');
  });
  test('converts every pair on the line', () => {
    assert.equal(inlineBold('**a** and **b**'), '<strong>a</strong> and <strong>b</strong>');
  });
  test('leaves an unpaired marker alone', () => {
    assert.equal(inlineBold('a ** b'), 'a ** b');
    assert.equal(inlineBold('****'), '****');
  });
});

describe('descriptionLineToken', () => {
  test('a blank (or whitespace-only) line is a blank token', () => {
    assert.deepEqual(descriptionLineToken(''), { kind: 'blank', text: '' });
    assert.deepEqual(descriptionLineToken('   '), { kind: 'blank', text: '' });
  });
  test('reads a ## heading label', () => {
    assert.deepEqual(descriptionLineToken('## Programme'), { kind: 'h', text: 'Programme' });
    assert.deepEqual(descriptionLineToken('#### Deep'), { kind: 'h', text: 'Deep' });
  });
  test('a single # is not a heading — that level is not emitted', () => {
    assert.deepEqual(descriptionLineToken('# Title'), { kind: 'text', text: '# Title' });
  });
  test('a whole-line bold is a heading, but bold inside a line is not', () => {
    assert.deepEqual(descriptionLineToken('**Tickets**'), { kind: 'h', text: 'Tickets' });
    assert.deepEqual(descriptionLineToken('a **b** c'), { kind: 'text', text: 'a **b** c' });
  });
  test('reads every bullet marker', () => {
    assert.deepEqual(descriptionLineToken('- one'), { kind: 'li', text: 'one' });
    assert.deepEqual(descriptionLineToken('* two'), { kind: 'li', text: 'two' });
    assert.deepEqual(descriptionLineToken('• three'), { kind: 'li', text: 'three' });
  });
  test('trims the line before classifying it', () => {
    assert.deepEqual(descriptionLineToken('   - one  '), { kind: 'li', text: 'one' });
  });
});

describe('parseDescriptionBlocks', () => {
  test('joins consecutive lines into one paragraph', () => {
    assert.deepEqual(parseDescriptionBlocks('one\ntwo'), [{ kind: 'p', text: 'one two' }]);
  });
  test('a blank line closes the paragraph', () => {
    assert.deepEqual(parseDescriptionBlocks('one\n\ntwo'), [
      { kind: 'p', text: 'one' },
      { kind: 'p', text: 'two' },
    ]);
  });
  test('collects consecutive bullets into one list', () => {
    assert.deepEqual(parseDescriptionBlocks('- a\n- b'), [{ kind: 'ul', items: ['a', 'b'] }]);
  });
  test('a heading closes the pending paragraph and the pending list', () => {
    assert.deepEqual(parseDescriptionBlocks('lead\n- a\n## H\ntail'), [
      { kind: 'p', text: 'lead' },
      { kind: 'ul', items: ['a'] },
      { kind: 'h', text: 'H' },
      { kind: 'p', text: 'tail' },
    ]);
  });
  test('a text line after a list closes the list', () => {
    assert.deepEqual(parseDescriptionBlocks('- a\ntail'), [
      { kind: 'ul', items: ['a'] },
      { kind: 'p', text: 'tail' },
    ]);
  });
  test('escapes the source before parsing', () => {
    assert.deepEqual(parseDescriptionBlocks('<script>'), [{ kind: 'p', text: '&lt;script&gt;' }]);
  });
  test('empty input yields no blocks', () => {
    assert.deepEqual(parseDescriptionBlocks(''), []);
    assert.deepEqual(parseDescriptionBlocks('\n\n'), []);
  });
  test('handles CRLF line endings', () => {
    assert.deepEqual(parseDescriptionBlocks('one\r\n\r\ntwo'), [
      { kind: 'p', text: 'one' },
      { kind: 'p', text: 'two' },
    ]);
  });
});

describe('renderDescriptionBody', () => {
  const blocks: readonly DescriptionBlock[] = [
    { kind: 'h', text: 'Ignored' },
    { kind: 'p', text: 'A **bold** line' },
    { kind: 'ul', items: ['one', '**two**'] },
  ];
  test('renders paragraphs and lists, and skips headings', () => {
    assert.equal(
      renderDescriptionBody(blocks),
      '<p>A <strong>bold</strong> line</p>' +
        '<ul class="desc-list"><li>one</li><li><strong>two</strong></li></ul>',
    );
  });
  test('no blocks renders nothing', () => {
    assert.equal(renderDescriptionBody([]), '');
  });
});

describe('parseSectionHead', () => {
  test('reads a known type tag and strips it from the label', () => {
    assert.deepEqual(parseSectionHead('[tickets] Biglietti'), {
      type: 'tickets',
      label: 'Biglietti',
    });
  });
  test('accepts a hyphenated type', () => {
    assert.deepEqual(parseSectionHead('[getting-there] Come arrivare'), {
      type: 'getting-there',
      label: 'Come arrivare',
    });
  });
  test('an unknown tag falls back to info but is still stripped', () => {
    assert.deepEqual(parseSectionHead('[weather] Meteo'), { type: 'info', label: 'Meteo' });
  });
  test('no tag at all is a neutral info section', () => {
    assert.deepEqual(parseSectionHead('Extra notes'), { type: 'info', label: 'Extra notes' });
  });
});

describe('splitDescriptionSections', () => {
  test('groups the blocks that follow each heading', () => {
    assert.deepEqual(
      splitDescriptionSections([
        { kind: 'h', text: 'One' },
        { kind: 'p', text: 'a' },
        { kind: 'h', text: 'Two' },
        { kind: 'ul', items: ['b'] },
      ]),
      [
        { label: 'One', body: [{ kind: 'p', text: 'a' }] },
        { label: 'Two', body: [{ kind: 'ul', items: ['b'] }] },
      ],
    );
  });
  test('a heading with no body is still a section', () => {
    assert.deepEqual(splitDescriptionSections([{ kind: 'h', text: 'Only' }]), [
      { label: 'Only', body: [] },
    ]);
  });
  test('blocks before the first heading belong to no section', () => {
    assert.deepEqual(splitDescriptionSections([{ kind: 'p', text: 'lead' }]), []);
  });
});

describe('renderDescriptionSection', () => {
  test('stamps the type, renders the icon and the body', () => {
    const html = renderDescriptionSection({
      label: '[tickets] Biglietti',
      body: [{ kind: 'p', text: 'Free' }],
    });
    assert.ok(html.startsWith('<section class="desc-sec" data-sec="tickets">'));
    assert.ok(html.includes('<span class="desc-h-tx">Biglietti</span>'));
    assert.ok(html.includes('<svg'));
    assert.ok(html.includes('<div class="desc-body"><p>Free</p></div>'));
  });
  test('bold inside a label survives', () => {
    const html = renderDescriptionSection({ label: '**Note**', body: [] });
    assert.ok(html.includes('<span class="desc-h-tx"><strong>Note</strong></span>'));
    assert.ok(html.includes('data-sec="info"'));
  });
});
