import { brightStyle } from '../../lib/map/styles/bright-typed.ts';
import { darkStyle } from '../../lib/map/styles/dark-typed.ts';
import { liveStyle } from '../../lib/map/live-style.ts';
import { MAP_ATTRIBUTION } from '../../lib/map/map-attribution.ts';
import type { StyleSpecification } from 'maplibre-gl';

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
// Both extracts are hosted off-Worker (25 MiB asset cap) and are therefore
// configurable; the defaults are the copies shipped with the site.
const PMTILES_URL =
  import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const DETAIL_URL =
  import.meta.env.PUBLIC_PMTILES_DETAIL_URL ?? `${location.origin}${B}/tiles/liguria.pmtiles`;

const BASES: Readonly<Record<string, StyleSpecification>> = { light: brightStyle, dark: darkStyle };

const build = liveStyle({
  pmtiles: PMTILES_URL,
  detail: DETAIL_URL,
  base: B,
  origin: location.origin,
  attribution: MAP_ATTRIBUTION,
});

/** The basemap style for a theme key, built by the tested pure transform. */
export const mapStyle = (key: string): StyleSpecification =>
  build(BASES[key] ?? brightStyle, key === 'dark');
