// Does the site hold together on the screens people actually use?
//
// The same pages at four widths, audited the same way each time: nothing lost,
// nothing running off the side, nothing too small to hit, nothing axe objects
// to. It runs through the kit and nothing else, so a wait that turns out to be
// unreliable has one place to be fixed rather than one per spec.
import { test } from './kit/index.ts';

const PAGES = [
  { name: 'the region feed', path: '/liguria/' },
  { name: 'the calendar', path: '/liguria/calendar/' },
  { name: 'saved events', path: '/favorites/' },
  // The form for making an event is server-rendered and so is not in the
  // static build these projects serve; it is audited against the real worker,
  // in ui-owner-shell.spec.ts.
];

for (const page of PAGES) {
  test(`${page.name} holds together`, async ({ app, audit }) => {
    await app.open(page.path);
    // Still, not silent. A layout audit needs the layout to have stopped
    // moving — measuring while an image or the account slot is still landing
    // gives a number that was true for one frame, which is how a spec passes
    // alone and fails under load. Waiting for the NETWORK to go quiet would be
    // a different and unkeepable promise: these pages load an analytics beacon
    // from another origin that is in flight for as long as it likes.
    await app.quiet();
    await audit.all();
  });
}

test('the map holds together, canvas and all', async ({ app, audit }) => {
  await app.open('/liguria/map/');
  // The map is the one page whose content arrives after the document does, so
  // the audit waits for the thing itself rather than for the page around it.
  await app.find('canvas.maplibregl-canvas').waitFor({ state: 'visible' });
  await app.quiet();
  await audit.all();
});
