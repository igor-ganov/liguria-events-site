import maplibregl from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import { inMapArea } from '../../lib/map/in-map-area.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { locateButton } from './locate-button.ts';
import type { MapContext } from './map-context.ts';
import type { Marker } from 'maplibre-gl';
import type { ToastKey } from '../../lib/map/map-toasts.ts';

const OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 };
const BUSY = 'map-locate-btn--busy';

// Read through a boxed access: the DOM types geolocation as always present,
// so a plain comparison would not even type-check, yet old and locked-down
// browsers really do ship without it.
const supported = (): boolean => Boolean(Object(navigator)['geolocation']);

const wrap = (button: HTMLButtonElement): HTMLElement => {
  const group = document.createElement('div');
  group.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  group.appendChild(button);
  return group;
};

/** Add the locate control: it drops a "you are here" dot, flies to it when it
 *  is inside the tiled area, and says why nothing happened when it is not. */
export const addLocateControl = (context: MapContext): void => {
  const { map, say } = context;
  const button = locateButton(context.ui.map.locate);
  let marker: Marker | undefined;
  const create = (at: [number, number]): Marker => {
    const dot = document.createElement('div');
    dot.className = 'map-me';
    return new maplibregl.Marker({ element: dot }).setLngLat(at).addTo(map);
  };
  const place = (at: [number, number]): void => {
    marker = [marker].filter(isDefined).map((dot) => dot.setLngLat(at)).at(0) ?? create(at);
  };
  const onPosition = (position: GeolocationPosition): void => {
    button.classList.remove(BUSY);
    const at: [number, number] = [position.coords.longitude, position.coords.latitude];
    place(at);
    // The type parameter belongs on the INNER call: easeTo returns the map, so
    // inferring from the first arm would make the second arm's void a mismatch.
    branch(inMapArea(at[0], at[1]))<void>(
      () => {
        map.easeTo({ center: at, zoom: Math.max(map.getZoom(), 14) });
      },
      () => say('outside'),
    );
  };
  const onError = (error: GeolocationPositionError): void => {
    button.classList.remove(BUSY);
    say(branch(error.code === error.PERMISSION_DENIED)<ToastKey>(() => 'denied', () => 'error'));
  };
  const request = (): void => {
    button.classList.add(BUSY);
    // getCurrentPosition is called SYNCHRONOUSLY inside the click handler:
    // browsers only raise the permission prompt from within the user gesture,
    // so any await before this call would suppress it. A previously denied
    // origin lands in onError (code 1) → the "blocked" message.
    navigator.geolocation.getCurrentPosition(onPosition, onError, OPTIONS);
  };
  button.addEventListener('click', () => branch(supported())(request, () => say('error')));
  map.addControl({ onAdd: () => wrap(button), onRemove: () => undefined }, 'top-left');
};
