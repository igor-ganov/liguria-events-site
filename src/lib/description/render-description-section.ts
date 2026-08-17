import { uiIcon } from '../icons/ui-icon.ts';
import { inlineBold } from './inline-bold.ts';
import { parseSectionHead } from './parse-section-head.ts';
import { renderDescriptionBody } from './render-description-body.ts';
import { SECTION_ICON } from './section-icon.ts';
import type { DescriptionSection } from './split-description-sections.ts';

/** One section: an accent icon badge and its label, then the body. The type is
 *  stamped as `data-sec` so the practical sections (getting there, tickets) can
 *  be styled as highlighted callout cards. */
export const renderDescriptionSection = (section: DescriptionSection): string => {
  const { type, label } = parseSectionHead(section.label);
  const icon = uiIcon(SECTION_ICON.get(type) ?? 'feed', 15);
  return (
    `<section class="desc-sec" data-sec="${type}">` +
    `<h3 class="desc-h"><span class="desc-h-ic">${icon}</span><span class="desc-h-tx">${inlineBold(label)}</span></h3>` +
    `<div class="desc-body">${renderDescriptionBody(section.body)}</div>` +
    `</section>`
  );
};
