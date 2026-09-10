import { PUSH_SETTINGS_KEY } from '../../sw/push-settings-key.ts';

const COLLECTOR = 'https://liguria-events-bot.igor-ganov.workers.dev';

/** The VAPID public key travels as base64url text and the subscribe call wants
 *  the raw bytes of it. */
const bytes = (base64: string): ArrayBuffer => {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)).buffer;
};

/** The worker reads this when a push wakes it; a worker cannot read
 *  localStorage, so the page leaves it where both can reach. */
const remember = async (place: string, lang: string): Promise<void> => {
  const cache = await caches.open(PUSH_SETTINGS_KEY);
  await cache.put(
    `https://dovego.it/${PUSH_SETTINGS_KEY}`,
    new Response(JSON.stringify({ place, lang }), { headers: { 'content-type': 'application/json' } }),
  );
};

/**
 * Turn the daily notification on: ask, subscribe, tell the sender where and
 * when. Answers whether it worked, so the switch can go back to off rather
 * than lying about a permission the reader refused.
 */
export const pushSubscribe = async (
  vapidKey: string,
  place: string,
  lang: string,
  hour: number,
): Promise<boolean> => {
  const permission = await Notification.requestPermission();
  const registration = await navigator.serviceWorker?.ready;
  const subscription = await Promise.all(
    [permission]
      .filter((answer) => answer === 'granted')
      .map(() =>
        registration?.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(vapidKey) }),
      ),
  ).catch(() => []);
  const endpoint = subscription.at(0)?.endpoint ?? '';
  const accepted = await Promise.all(
    [endpoint]
      .filter((url) => url !== '')
      .map(async (url) => {
        await remember(place, lang);
        const response = await fetch(`${COLLECTOR}/push/subscribe`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: url, place, lang, hour }),
        });
        return response.ok;
      }),
  ).catch(() => [false]);
  return accepted.at(0) === true;
};
