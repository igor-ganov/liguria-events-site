// "Download PDF" for a saved route: rebuild the itinerary from the embedded
// #route-data (as the read-only view does), lay it out with routePdfLines, and
// render a real downloadable PDF with jsPDF (lazily imported so it stays out of
// the main bundle). Replaces the old window.print() print-dialog flow. This
// module is the stable import surface; the reader, the writer and every pure
// layout part live one function per file next to it and are unit-tested.
export type { RoutePdfDoc } from './read-route-pdf-lines.ts';
export { downloadRoutePdf } from './download-route-pdf.ts';
export { initRoutePdf } from './init-route-pdf.ts';
