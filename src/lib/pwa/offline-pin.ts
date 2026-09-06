/** The pin, drawn inline because the offline page may not fetch anything: an
 *  image it has to ask the network for is an image nobody sees. It is the same
 *  drawing as the favicon and the launcher icons — see scripts/build-icons.ts,
 *  which rasterises those from the same two paths. */
export const OFFLINE_PIN = `<svg viewBox="0 0 32 40" aria-hidden="true">
  <path d="M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z" fill="#f2822a" />
  <path d="M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" />
</svg>`;
