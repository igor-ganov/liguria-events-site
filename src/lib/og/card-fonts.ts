import { CARD_TEXT_FONT_BASE64 } from './card-text-font-data.ts';
import { CARD_TITLE_FONT_BASE64 } from './card-title-font-data.ts';
import { decodeFont } from './decode-font.ts';

/**
 * The faces the card is drawn with, decoded once per isolate. They travel in
 * the bundle rather than being fetched: a worker has no fonts of its own, and
 * the origin it believes it is answering for is not the one the request came
 * in on.
 *
 * The serif first, the sans second — the order the renderer searches when a
 * glyph is missing from the face that was asked for, which is what puts a
 * Russian title on a card set in a Latin-only serif.
 */
const held: { faces: readonly ArrayBuffer[] | undefined } = { faces: undefined };

export const cardFonts = (): readonly ArrayBuffer[] =>
  (held.faces ??= [decodeFont(CARD_TITLE_FONT_BASE64), decodeFont(CARD_TEXT_FONT_BASE64)]);
