import { descriptionLineToken } from './description-line-token.ts';
import { escapeDescriptionHtml } from './escape-description-html.ts';
import type { DescriptionBlock } from './description-block.ts';
import type { DescriptionLineToken } from './description-line-token.ts';

// The fold's state: the blocks closed so far, plus the paragraph and the list
// still being collected. The two are never pending at the same time — a text
// line closes the list, a bullet closes the paragraph — so flushing both is
// always safe.
type Acc = {
  readonly blocks: readonly DescriptionBlock[];
  readonly para: readonly string[];
  readonly list: readonly string[];
};

const EMPTY: Acc = { blocks: [], para: [], list: [] };

const paraBlocks = (para: readonly string[]): readonly DescriptionBlock[] =>
  [para]
    .filter((lines) => lines.length > 0)
    .map((lines): DescriptionBlock => ({ kind: 'p', text: lines.join(' ') }));

const listBlocks = (list: readonly string[]): readonly DescriptionBlock[] =>
  [list].filter((items) => items.length > 0).map((items): DescriptionBlock => ({ kind: 'ul', items }));

const flushed = (acc: Acc): readonly DescriptionBlock[] => [
  ...acc.blocks,
  ...paraBlocks(acc.para),
  ...listBlocks(acc.list),
];

type Step = (acc: Acc, text: string) => Acc;

const STEP: Readonly<Record<DescriptionLineToken['kind'], Step>> = {
  blank: (acc): Acc => ({ blocks: flushed(acc), para: [], list: [] }),
  h: (acc, text): Acc => ({ blocks: [...flushed(acc), { kind: 'h', text }], para: [], list: [] }),
  li: (acc, text): Acc => ({
    blocks: [...acc.blocks, ...paraBlocks(acc.para)],
    para: [],
    list: [...acc.list, text],
  }),
  text: (acc, text): Acc => ({
    blocks: [...acc.blocks, ...listBlocks(acc.list)],
    para: [...acc.para, text],
    list: [],
  }),
};

/** Parse light Markdown into blocks. The source is HTML-escaped FIRST, so the
 *  Markdown markers are the only markup that survives. */
export const parseDescriptionBlocks = (markdown: string): readonly DescriptionBlock[] =>
  flushed(
    escapeDescriptionHtml(markdown)
      .split(/\r?\n/)
      .map(descriptionLineToken)
      .reduce<Acc>((acc, token) => STEP[token.kind](acc, token.text), EMPTY),
  );
