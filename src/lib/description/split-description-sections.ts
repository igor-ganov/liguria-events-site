import type { DescriptionBlock } from './description-block.ts';

/** A heading and the blocks that follow it, up to the next heading. */
export type DescriptionSection = {
  readonly label: string;
  readonly body: readonly DescriptionBlock[];
};

const intoLast = (
  sections: readonly DescriptionSection[],
  block: DescriptionBlock,
): readonly DescriptionSection[] => [
  ...sections.slice(0, -1),
  ...sections
    .slice(-1)
    .map((section) => ({ label: section.label, body: [...section.body, block] })),
];

const step = (
  sections: readonly DescriptionSection[],
  block: DescriptionBlock,
): readonly DescriptionSection[] => {
  switch (block.kind) {
    case 'h':
      return [...sections, { label: block.text, body: [] }];
    default:
      return intoLast(sections, block);
  }
};

/** Group heading-led blocks into sections. Blocks before the first heading are
 *  the lead, not a section — they belong to no section and are dropped here. */
export const splitDescriptionSections = (
  blocks: readonly DescriptionBlock[],
): readonly DescriptionSection[] => blocks.reduce<readonly DescriptionSection[]>(step, []);
