import { branch } from '../branch.ts';
import { clipText } from './clip-text.ts';
import { escapeAttr } from './escape-attr.ts';

// A popup card is ~264px wide; past this the blurb pushes the source chips off
// the visible card, so it is clipped at a whole word instead.
const DESC_LIMIT = 150;

/**
 * The one-paragraph blurb of a rich popup, clipped to the card's width. An
 * absent or empty description renders nothing rather than an empty paragraph.
 */
export const popupDesc = (text: string | undefined): string =>
  branch((text ?? '') === '')(
    () => '',
    () => `<p class="map-pop-desc">${escapeAttr(clipText(DESC_LIMIT)(text ?? ''))}</p>`,
  );
