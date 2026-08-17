import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { MapLibreMap } from 'maplibre-gl';
import type { ToastKey } from '../../lib/map/map-toasts.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** What every map flow shares: the live map and its canvas, the page's language
 *  and data, the region it opened on, and the one feedback channel. */
export type MapContext = Readonly<{
  map: MapLibreMap;
  canvas: HTMLElement;
  lang: Locale;
  ui: Ui;
  events: readonly CompactEvent[];
  region: string | undefined;
  say: (key: ToastKey) => void;
}>;
