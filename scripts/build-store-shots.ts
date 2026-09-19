// The screenshots a store listing needs, taken from the live site at a phone's
// size and a tablet's.
//
// Run: bun run scripts/build-store-shots.ts  (output: store/screenshots/)
//
// Taken by a browser rather than by hand, so a release does not depend on
// somebody remembering which pages to capture and the next one looks like this
// one. The app IS the site, so a phone-sized render of the site is what the app
// shows — there is nothing separate to photograph.
//
// Through Playwright's own CLI rather than its library: launching a browser
// from this runtime hangs on the debugging pipe, and the CLI is a node process
// that does the same job in one line.
import { mkdir } from 'node:fs/promises';

const SITE = 'https://dovego.it';

// Emulated devices rather than raw viewport sizes: a 1080-pixel viewport is a
// DESKTOP width, so asking for one gives a store listing full of screenshots
// of the desktop site. A device brings its own width AND its pixel ratio, so
// "Pixel 5" is 393 CSS pixels rendered at 1080 — a phone layout at a phone's
// resolution, which is what the listing is for.
const SIZES = [
  { name: 'phone', device: 'Pixel 5' },
  { name: 'tablet', device: 'iPad Pro 11' },
];

/** What the app is for, in the order somebody meets it. `settle` is the thing
 *  whose presence means the page has finished — never a timer. */
const SHOTS = [
  { file: '1-feed', path: '/liguria/', settle: '.feed-list' },
  { file: '2-calendar', path: '/liguria/calendar/', settle: '.cal-grid' },
  // A marker, not the canvas: the canvas exists the moment the engine starts,
  // so waiting on it photographs a loading spinner over an empty rectangle.
  { file: '3-map', path: '/liguria/map/', settle: '.maplibregl-marker' },
  // An event page rather than another list: it is what a shared link opens,
  // and the one screen that shows what the app is actually for.
  { file: '4-event', path: '/event/95e1c06f364b/', settle: '.event-hero img, h1' },
  { file: '5-notifications', path: '/notifications/', settle: '[data-notify-toggle]' },
];

await mkdir('store/screenshots', { recursive: true });

for (const size of SIZES) {
  for (const shot of SHOTS) {
    const out = `store/screenshots/${size.name}-${shot.file}.png`;
    const run = Bun.spawnSync([
      'npx',
      'playwright',
      'screenshot',
      `--device=${size.device}`,
      `--wait-for-selector=${shot.settle}`,
      `${SITE}${shot.path}`,
      out,
    ]);
    process.stdout.write(`${run.exitCode === 0 ? 'ok  ' : 'FAIL'} ${out}\n`);
  }
}
