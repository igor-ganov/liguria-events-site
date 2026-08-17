import { pdfLineStyle } from './pdf-line-style.ts';
import { pdfTextParts } from './pdf-text-parts.ts';
import { placePdfLine } from './place-pdf-line.ts';
import { routePdfSlug } from './route-pdf-slug.ts';
import type { RoutePdfDoc } from './read-route-pdf-lines.ts';

const MARGIN = 48;

/** Shell: draw the laid-out lines with jsPDF (imported lazily so it stays out of
 *  the main bundle) and hand the finished file to the browser. */
export const emitRoutePdf = async (doc: RoutePdfDoc): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const bottom = pdf.internal.pageSize.getHeight() - MARGIN;
  const cursor = { y: MARGIN };
  const write = (text: string, x: number, size: number, gap: number): void => {
    pdf.setFontSize(size);
    pdfTextParts(pdf.splitTextToSize(text, pageWidth - x - MARGIN)).forEach((part) => {
      const spot = placePdfLine(cursor.y, bottom, MARGIN);
      [spot].filter((where) => where.newPage).forEach(() => pdf.addPage());
      pdf.text(part, x, spot.y);
      cursor.y = spot.y + gap;
    });
  };
  doc.lines.forEach((line) => {
    const style = pdfLineStyle(line.kind);
    cursor.y += style.before;
    write(line.text, MARGIN + style.indent, style.size, style.gap);
    cursor.y += style.after;
  });
  pdf.save(`${routePdfSlug(doc.title)}.pdf`);
};
