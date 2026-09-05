// Wait for the built worker bundle to exist, then get out of the way.
//
// Playwright starts every web server at once and runs globalSetup afterwards,
// so there is no ordering to lean on: the static server's command builds the
// site, and this is how the worker's command waits for that build instead of
// racing it. Racing it looked like an ECONNREFUSED or a page timeout in a spec
// that had nothing to do with either.
import { existsSync } from 'node:fs';

const BUNDLE = 'dist/_worker.js/index.js';

const watch = setInterval(() => {
  [existsSync(BUNDLE)].filter(Boolean).forEach(() => {
    clearInterval(watch);
    process.exit(0);
  });
}, 500);
