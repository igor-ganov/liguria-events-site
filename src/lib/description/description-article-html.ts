/**
 * Render an event description written as light Markdown into a DESIGNED article:
 * a lead paragraph, then sections introduced by an accent icon badge + label,
 * with the practical sections (getting there, tickets) shown as highlighted
 * callout cards — not one undifferentiated wall of text.
 *
 * The input comes from our own enrichment pipeline, but it embeds source text,
 * so everything is HTML-escaped first and only a tiny, fixed Markdown subset is
 * then re-introduced (headings, bullet lists, bold) — no raw HTML survives.
 */
import { branch } from '../branch.ts';
import { parseDescriptionBlocks } from './parse-description-blocks.ts';
import { renderDescriptionBody } from './render-description-body.ts';
import { renderDescriptionSection } from './render-description-section.ts';
import { splitDescriptionSections } from './split-description-sections.ts';
import type { DescriptionBlock } from './description-block.ts';

const leadHtml = (blocks: readonly DescriptionBlock[]): string =>
  branch(blocks.length === 0)(
    () => '',
    () => `<div class="desc-lead">${renderDescriptionBody(blocks)}</div>`,
  );

// Everything before the first heading is the lead; with no heading at all the
// whole description is.
const headIndex = (blocks: readonly DescriptionBlock[]): number =>
  [blocks.findIndex((block) => block.kind === 'h')].filter((index) => index >= 0)[0] ??
  blocks.length;

export const descriptionArticleHtml = (markdown: string): string => {
  const blocks = parseDescriptionBlocks(markdown);
  const head = headIndex(blocks);
  const sections = splitDescriptionSections(blocks.slice(head))
    .filter((section) => section.label !== '')
    .map(renderDescriptionSection)
    .join('');
  return `<div class="event-article">${leadHtml(blocks.slice(0, head))}${sections}</div>`;
};
