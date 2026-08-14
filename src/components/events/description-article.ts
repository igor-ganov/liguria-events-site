/**
 * Render an event description written as light Markdown into a DESIGNED article:
 * a lead paragraph, then sections introduced by an accent icon badge + label,
 * with the practical sections (getting there, tickets) shown as highlighted
 * callout cards — not one undifferentiated wall of text.
 *
 * Each section heading may carry a stable ASCII type tag the enrichment emits —
 * `## [tickets] Biglietti` — so the icon and callout styling work the same in
 * every language without matching localized words. The tag is stripped from the
 * visible label; a heading with no tag falls back to a neutral "info" section.
 *
 * The input comes from our own enrichment pipeline, but it embeds source text,
 * so everything is HTML-escaped first and only a tiny, fixed Markdown subset is
 * then re-introduced (headings, bullet lists, bold) — no raw HTML survives.
 */
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { UiIconName } from '../../lib/icons/ui-icon-paths.ts';

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Bold spans, applied AFTER escaping (the `*` markers survive escaping).
const inline = (text: string): string =>
  text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// A section label: a `## Heading`, or a whole line that is entirely bold.
const HEADING = /^(?:#{2,4}\s+(.*)|\*\*(.+)\*\*)$/;
const BULLET = /^[-*•]\s+(.*)$/;
// An optional leading type tag the enrichment emits, e.g. "[tickets] Biglietti".
const TYPE_TAG = /^\s*\[([a-z-]+)\]\s*/;

const SECTION_ICON: Readonly<Record<string, UiIconName>> = {
  programme: 'star',
  performers: 'gem',
  'getting-there': 'pin',
  tickets: 'ticket',
  when: 'calendar',
  info: 'feed',
};

type Block =
  | { readonly kind: 'h'; readonly text: string }
  | { readonly kind: 'p'; readonly text: string }
  | { readonly kind: 'ul'; readonly items: readonly string[] };

const parseBlocks = (markdown: string): readonly Block[] => {
  const lines = escapeHtml(markdown).split(/\r?\n/);
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = (): void => {
    if (para.length > 0) {
      blocks.push({ kind: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const flushList = (): void => {
    if (list.length > 0) {
      blocks.push({ kind: 'ul', items: list });
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flushPara();
      flushList();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ kind: 'h', text: heading[1] ?? heading[2] ?? '' });
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet) {
      flushPara();
      list.push(bullet[1] ?? '');
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
};

const renderBody = (blocks: readonly Block[]): string =>
  blocks
    .map((block) =>
      block.kind === 'ul'
        ? `<ul class="desc-list">${block.items.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`
        : block.kind === 'p'
          ? `<p>${inline(block.text)}</p>`
          : '',
    )
    .join('');

const renderSection = (rawLabel: string, body: readonly Block[]): string => {
  const tag = TYPE_TAG.exec(rawLabel);
  const type = tag && SECTION_ICON[tag[1] ?? ''] !== undefined ? (tag[1] ?? 'info') : 'info';
  const label = rawLabel.replace(TYPE_TAG, '');
  const icon = uiIcon(SECTION_ICON[type] ?? 'feed', 15);
  return (
    `<section class="desc-sec" data-sec="${type}">` +
    `<h3 class="desc-h"><span class="desc-h-ic">${icon}</span><span class="desc-h-tx">${inline(label)}</span></h3>` +
    `<div class="desc-body">${renderBody(body)}</div>` +
    `</section>`
  );
};

export const descriptionArticleHtml = (markdown: string): string => {
  const blocks = parseBlocks(markdown);
  const firstHeading = blocks.findIndex((block) => block.kind === 'h');
  const leadBlocks = firstHeading === -1 ? blocks : blocks.slice(0, firstHeading);
  const rest = firstHeading === -1 ? [] : blocks.slice(firstHeading);
  const lead = leadBlocks.length === 0 ? '' : `<div class="desc-lead">${renderBody(leadBlocks)}</div>`;

  const sections: string[] = [];
  let label = '';
  let body: Block[] = [];
  const flush = (): void => {
    if (label !== '') sections.push(renderSection(label, body));
    body = [];
  };
  for (const block of rest) {
    if (block.kind === 'h') {
      flush();
      label = block.text;
      continue;
    }
    body.push(block);
  }
  flush();

  return `<div class="event-article">${lead}${sections.join('')}</div>`;
};

/** Strip the Markdown (and any leading type tag) to a single-line plain string
 *  for meta tags, cards and search — where the markers would otherwise leak. */
export const descriptionPlain = (markdown: string): string =>
  markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[[a-z-]+\]\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
