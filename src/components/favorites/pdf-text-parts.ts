import { asArray } from './as-array.ts';
import { isString } from './is-string.ts';

/** The lines to draw for one piece of PDF text. jsPDF's splitTextToSize returns
 *  a plain string when the text fits and a list of strings when it wraps: a list
 *  contributes its items (and is itself no string), a bare string contributes
 *  itself. Anything else contributes nothing rather than printing "undefined". */
export const pdfTextParts = (wrapped: unknown): readonly string[] =>
  [...asArray(wrapped), wrapped].filter(isString);
