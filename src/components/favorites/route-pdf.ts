// "Download PDF" for a saved route: rebuild the itinerary from the embedded
// #route-data (as the read-only view does), lay it out with routePdfLines, and
// render a real downloadable PDF with jsPDF (lazily imported so it stays out of
// the main bundle). Replaces the old window.print() print-dialog flow.
import { poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import { routePdfLines } from '../../lib/favorites/route-pdf-lines.ts';
import type { PdfLineKind } from '../../lib/favorites/route-pdf-lines.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { fetchCorpus, parsePayload } from './route-payload.ts';

const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'route';

const STYLE: Record<PdfLineKind, { size: number; gap: number; indent: number }> = {
  title: { size: 20, gap: 30, indent: 0 },
  day: { size: 14, gap: 22, indent: 0 },
  stop: { size: 11, gap: 17, indent: 0 },
  leg: { size: 9, gap: 14, indent: 16 },
  base: { size: 9, gap: 14, indent: 16 },
};

export const downloadRoutePdf = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data');
  if (!island?.textContent) return;
  const { lang, ui } = readUiIsland();
  const payload = parsePayload(island.textContent);
  const stops = [...(await fetchCorpus()), ...Object.values(payload.pois).map(poiToStop)];
  const byId = new Map(stops.map((s) => [s.id, s]));
  const days = routeFromGroups(payload.groups, payload.mode, byId);
  if (days.length === 0) return;
  const baseOf = (day: string) => resolveDayBase(day, payload.dayBases, payload.base, readGlobalBase(), payload.dayFinals);
  const title = document.querySelector('h1')?.textContent?.trim() || ui.route.title;
  const lines = routePdfLines(days, {
    title,
    lang,
    mode: payload.mode,
    durations: payload.durations,
    labels: { min: ui.route.min, fromBase: ui.route.fromBase, toBase: ui.route.toBase },
    baseOf,
  });

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const bottom = doc.internal.pageSize.getHeight() - margin;
  let y = margin;
  const write = (text: string, x: number, size: number, gap: number): void => {
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(text, pageW - x - margin);
    const parts = Array.isArray(wrapped) ? wrapped : [wrapped];
    for (const part of parts) {
      if (y > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(part, x, y);
      y += gap;
    }
  };
  for (const line of lines) {
    const s = STYLE[line.kind];
    if (line.kind === 'day') y += 8;
    write(line.text, margin + s.indent, s.size, s.gap);
    if (line.kind === 'title') y += 6;
  }
  doc.save(`${slug(title)}.pdf`);
};

let wired = false;

export const initRoutePdf = (): void => {
  if (wired) return;
  wired = true;
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    if (target?.closest('[data-route-pdf]')) void downloadRoutePdf();
  });
};
