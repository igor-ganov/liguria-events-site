import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { brightStyle } from '../../lib/map/styles/bright-typed.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { pickerStyle } from '../../lib/map/picker-style.ts';
import { setValue } from '../../lib/dom/set-value.ts';
import { startCoords } from './start-coords.ts';

// A self-contained location picker for the event form: click/drag a pin on the
// basemap and it writes lng/lat into the form's hidden inputs. It carries its
// OWN minimal copy of the PMTiles style (see pickerStyle) so it can never
// affect the live map.

const B = import.meta.env.BASE_URL.replace(/\/$/, '');
const PMTILES_URL =
  import.meta.env.PUBLIC_PMTILES_URL ?? `${location.origin}${B}/tiles/italy.pmtiles`;
const GENOA: [number, number] = [9.19, 44.4056];

/**
 * The form's own hidden coordinate field.
 *
 * Scoped to the form, and checked to BE an input, because a document-wide
 * `[data-lat]` matched the region picker's city list first: eighty
 * `<li class="rp-city" data-lat="…">` sit above the form in the DOM. An `<li>`
 * has a `value` property of its own — its ordinal, which is 0 — so the picker
 * read 0/0, opened over the Atlantic at zoom 14, and looked like a map that
 * had failed to load.
 */
const input = (form: Element | undefined, selector: string): HTMLInputElement | undefined =>
  [form?.querySelector(selector)]
    .filter((node): node is HTMLInputElement => node instanceof HTMLInputElement)
    .at(0);

const start = (el: HTMLElement): void => {
  el.dataset['ready'] = 'true';
  const form = el.closest('form') ?? undefined;
  const latIn = input(form, '[data-lat]');
  const lngIn = input(form, '[data-lng]');
  maplibregl.addProtocol('pmtiles', new Protocol().tile);
  const from = startCoords(latIn?.value, lngIn?.value);
  const map = new maplibregl.Map({
    container: el,
    style: pickerStyle(brightStyle, { pmtiles: PMTILES_URL, base: B, origin: location.origin }),
    center: from[0] ?? GENOA,
    zoom: from.map(() => 14)[0] ?? 8,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  let marker: maplibregl.Marker | undefined;
  const write = (at: maplibregl.LngLat): void => {
    setValue(latIn, at.lat.toFixed(6));
    setValue(lngIn, at.lng.toFixed(6));
  };
  const create = (at: maplibregl.LngLat): maplibregl.Marker => {
    const pin = new maplibregl.Marker({ color: '#e8590c', draggable: true })
      .setLngLat(at)
      .addTo(map);
    pin.on('dragend', () => write(pin.getLngLat()));
    return pin;
  };
  const place = (at: maplibregl.LngLat): void => {
    const pin = marker ?? create(at);
    pin.setLngLat(at);
    marker = pin;
    write(at);
  };
  from.forEach(([lng, lat]) => place(new maplibregl.LngLat(lng, lat)));
  map.on('click', (event) => place(event.lngLat));
};

/** Wire the event form's map, once per page. */
export const initLocationPicker = (): void => {
  [document.querySelector<HTMLElement>('[data-loc-map]') ?? undefined]
    .filter(isDefined)
    .filter((el) => el.dataset['ready'] !== 'true')
    .forEach(start);
};
