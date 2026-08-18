import type { CompactEvent } from './event-schema.ts';

/** The compact index does not name the primary source — infer it from the URL
 *  host for labeling (and for attributing the hero photo). An event submitted on
 *  the site has no source link at all, so there is no host to read and no source
 *  to name: that is a normal state, not a malformed event. */
export const sourceOf = (event: CompactEvent): string => {
  const host = [event.u]
    .filter((url) => URL.canParse(url))
    .map((url) => new URL(url).hostname.replace(/^www\./, ''))
    .at(0) ?? '';
  const bySuffix: readonly (readonly [string, string])[] = [
    ['visitgenoa.it', 'visitgenoa'],
    ['mentelocale.it', 'mentelocale'],
    ['genovateatro.it', 'genovateatro'],
    ['palazzoducale.genova.it', 'palazzoducale'],
    ['portoantico.it', 'portoantico'],
  ];
  return bySuffix.find(([suffix]) => host.endsWith(suffix))?.[1] ?? host;
};
