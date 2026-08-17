import { inlineBold } from './inline-bold.ts';
import type { DescriptionBlock } from './description-block.ts';

const renderBlock = (block: DescriptionBlock): string => {
  switch (block.kind) {
    case 'ul':
      return `<ul class="desc-list">${block.items.map((item) => `<li>${inlineBold(item)}</li>`).join('')}</ul>`;
    case 'p':
      return `<p>${inlineBold(block.text)}</p>`;
    default:
      return '';
  }
};

/** Blocks → HTML. A heading is a SECTION boundary, not body content, so it
 *  renders to nothing here. */
export const renderDescriptionBody = (blocks: readonly DescriptionBlock[]): string =>
  blocks.map(renderBlock).join('');
