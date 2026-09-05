import { CEILING_MS } from '../ceiling-ms.ts';
import { waitQuiet } from '../probes/wait-quiet.ts';
import { withCeiling } from '../with-ceiling.ts';
import type { Locator, Page } from '@playwright/test';

/** How long the layout may keep moving before the wait gives up: ninety frames
 *  of it, and the kit's ceiling as a backstop for a page getting no frames. */
const QUIET: readonly [number, number] = [90, CEILING_MS];
import type { Net } from './net.ts';

/**
 * The page, addressed the way a spec thinks about it.
 *
 * `open` returns when the document is loaded — never when a timer says so, and
 * deliberately NOT when the network falls silent. A page with a map streams
 * tiles for as long as it is on screen, so waiting for silence there waits
 * forever. A spec then waits on the state it actually cares about, which is
 * the only wait that can prove anything; `settle` is there for the pages where
 * that state IS the network.
 */
export type App = Readonly<{
  open: (path: string) => Promise<void>;
  reload: () => Promise<void>;
  settle: () => Promise<void>;
  quiet: () => Promise<void>;
  find: (selector: string) => Locator;
  button: (name: string | RegExp) => Locator;
  link: (name: string | RegExp) => Locator;
  heading: (name: string | RegExp) => Locator;
  /** The raw page. Reaching for it means the kit is missing something — say so
   *  in a comment when you do, so the gap is visible rather than routine. */
  page: Page;
}>;

const loaded = (page: Page): Promise<unknown> =>
  page.waitForFunction(() => document.readyState === 'complete');

export const appFor = (page: Page, net: Net): App => ({
  open: async (path) => {
    await page.goto(path);
    await loaded(page);
  },
  reload: async () => {
    await page.reload();
    await loaded(page);
  },
  settle: () => net.settled(),
  // Ninety frames: a second and a half on a healthy machine, longer on a
  // loaded one, and only ever reached by a page that redraws forever. The
  // in-page backstop is for a browser that has stopped handing out frames
  // altogether; the outer ceiling is so that a hang is named rather than
  // arriving as an anonymous test timeout.
  quiet: async () => {
    await withCeiling(page.evaluate(waitQuiet, QUIET), 'the layout to stop moving');
  },
  find: (selector) => page.locator(selector),
  button: (name) => page.getByRole('button', { name }),
  link: (name) => page.getByRole('link', { name }),
  heading: (name) => page.getByRole('heading', { name }),
  page,
});
