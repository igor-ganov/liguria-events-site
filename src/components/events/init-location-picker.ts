import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import brightStyle from '../../lib/map/styles/bright.json';

// A self-contained location picker for the event form: click/drag a pin on the
// basemap and it writes lng/lat into the form's hidden inputs. It carries its
// OWN minimal copy of the PMTiles style (a trimmed version of MapView's
// buildStyle) so it can never affect the live map.

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const PMTILES_URL = import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const GENOA: [number, number] = [9.19, 44.4056];

const glyphFont = (font: string): string =>
  /^noto sans (regular|bold|italic)$/i.test(font) ? font.toLowerCase().replace(/\s+/g, '-') : 'noto-sans-regular';

const pickerStyle = (): maplibregl.StyleSpecification => {
  const style = structuredClone(brightStyle) as unknown as maplibregl.StyleSpecification;
  style.sources = { openmaptiles: { type: 'vector', url: `pmtiles://${PMTILES_URL}` } };
  style.layers = style.layers.filter((l) => (l as { 'source-layer'?: string })['source-layer'] !== 'poi');
  style.glyphs = `${B}/font/{fontstack}/{range}.pbf`;
  style.sprite = `${location.origin}${B}/sprite/poi-color/sprite`;
  for (const layer of style.layers) {
    const layout = (layer as { layout?: { 'text-font'?: readonly string[] } }).layout;
    if (layout && Array.isArray(layout['text-font'])) {
      layout['text-font'] = [glyphFont(layout['text-font'][0] ?? 'Noto Sans Regular')];
    }
  }
  return style;
};

export const initLocationPicker = (): void => {
  const el = document.querySelector<HTMLElement>('[data-loc-map]');
  if (!el || el.dataset['ready'] === 'true') return;
  el.dataset['ready'] = 'true';
  const latIn = document.querySelector<HTMLInputElement>('[data-lat]');
  const lngIn = document.querySelector<HTMLInputElement>('[data-lng]');
  maplibregl.addProtocol('pmtiles', new Protocol().tile);

  const startLat = Number.parseFloat(latIn?.value ?? '');
  const startLng = Number.parseFloat(lngIn?.value ?? '');
  const hasStart = Number.isFinite(startLat) && Number.isFinite(startLng);
  const map = new maplibregl.Map({
    container: el,
    style: pickerStyle(),
    center: hasStart ? [startLng, startLat] : GENOA,
    zoom: hasStart ? 14 : 8,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  let marker: maplibregl.Marker | undefined;
  const write = (at: maplibregl.LngLat): void => {
    if (latIn) latIn.value = at.lat.toFixed(6);
    if (lngIn) lngIn.value = at.lng.toFixed(6);
  };
  const place = (at: maplibregl.LngLat): void => {
    const m = marker ?? new maplibregl.Marker({ color: '#e8590c', draggable: true }).setLngLat(at).addTo(map);
    m.setLngLat(at);
    if (!marker) m.on('dragend', () => write(m.getLngLat()));
    marker = m;
    write(at);
  };
  if (hasStart) place(new maplibregl.LngLat(startLng, startLat));
  map.on('click', (e) => place(e.lngLat));
};
