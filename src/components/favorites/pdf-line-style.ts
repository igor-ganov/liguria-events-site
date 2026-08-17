import type { PdfLineKind } from '../../lib/favorites/route-pdf-lines.ts';

/** How one kind of PDF line is set: type size, the advance after it, its indent
 *  from the margin and the extra padding before/after it. */
export type PdfStyle = Readonly<{
  size: number;
  gap: number;
  indent: number;
  before: number;
  after: number;
}>;

const BODY: PdfStyle = { size: 11, gap: 17, indent: 0, before: 0, after: 0 };

const STYLES: ReadonlyMap<PdfLineKind, PdfStyle> = new Map<PdfLineKind, PdfStyle>([
  ['title', { size: 20, gap: 30, indent: 0, before: 0, after: 6 }],
  ['day', { size: 14, gap: 22, indent: 0, before: 8, after: 0 }],
  ['stop', BODY],
  ['leg', { size: 9, gap: 14, indent: 16, before: 0, after: 0 }],
  ['base', { size: 9, gap: 14, indent: 16, before: 0, after: 0 }],
]);

/** The style of a PDF line — body text for a kind with no entry of its own. */
export const pdfLineStyle = (kind: PdfLineKind): PdfStyle => STYLES.get(kind) ?? BODY;
