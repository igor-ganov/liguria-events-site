import { toastText } from '../../lib/map/map-toasts.ts';
import type { ToastKey } from '../../lib/map/map-toasts.ts';

/** How long a toast stays up. */
const LIFETIME = 4200;

/** The map's own feedback channel: a transient line over the canvas. It exists
 *  because the basemap and the place shards are finite, so several perfectly
 *  reasonable actions (locate me, show places) can have nothing to show. */
export const mapToast =
  (canvas: HTMLElement, lang: string) =>
  (key: ToastKey): void => {
    const el = document.createElement('div');
    el.className = 'map-toast';
    el.textContent = toastText(key, lang);
    canvas.appendChild(el);
    setTimeout(() => el.remove(), LIFETIME);
  };
