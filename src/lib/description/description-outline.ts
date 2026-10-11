import { descriptionPlain } from './description-plain.ts';
import { parseDescriptionBlocks } from './parse-description-blocks.ts';
import { parseSectionHead } from './parse-section-head.ts';
import { renderDescriptionBody } from './render-description-body.ts';
import { splitDescriptionSections } from './split-description-sections.ts';
import type { DescriptionBlock } from './description-block.ts';

/** One headed part of a description: what kind it is, what it is called, and
 *  its words — as markup to show and as plain text to compare. */
export type DescriptionPart = Readonly<{ type: string; label: string; html: string; plain: string }>;

const wordsOf = (block: DescriptionBlock): readonly string[] => {
  switch (block.kind) {
    case 'ul':
      return block.items;
    default:
      return [block.text];
  }
};

// Everything before the first heading is the lead; with no heading at all the
// whole description is.
const headIndex = (blocks: readonly DescriptionBlock[]): number =>
  [blocks.findIndex((block) => block.kind === 'h')].filter((index) => index >= 0)[0] ?? blocks.length;

/**
 * A description cut into what the page is laid out from: the lead, and each
 * headed part on its own. The page decides where a part goes — a card of its
 * own, under a widget that already says the same thing, or nowhere — which it
 * could not do while the description was one block of markup.
 */
export const descriptionOutline = (markdown: string): Readonly<{ lead: string; parts: readonly DescriptionPart[] }> => {
  const blocks = parseDescriptionBlocks(markdown);
  const head = headIndex(blocks);
  return {
    lead: renderDescriptionBody(blocks.slice(0, head)),
    parts: splitDescriptionSections(blocks.slice(head))
      .filter((section) => section.label !== '')
      .map((section) => ({
        ...parseSectionHead(section.label),
        html: renderDescriptionBody(section.body),
        plain: descriptionPlain(section.body.flatMap(wordsOf).join(' ')),
      })),
  };
};
