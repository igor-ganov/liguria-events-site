import type { CompactEvent } from './event-schema.ts';

/** The compact index does not name the primary source — infer it from the URL
 *  host for labeling (and for attributing the hero photo). */
export const sourceOf = (event: CompactEvent): string => {
  const host = new URL(event.u).hostname.replace(/^www\./, '');
  const bySuffix: readonly (readonly [string, string])[] = [
    ['visitgenoa.it', 'visitgenoa'],
    ['mentelocale.it', 'mentelocale'],
    ['genovateatro.it', 'genovateatro'],
    ['palazzoducale.genova.it', 'palazzoducale'],
    ['portoantico.it', 'portoantico'],
  ];
  return bySuffix.find(([suffix]) => host.endsWith(suffix))?.[1] ?? host;
};
