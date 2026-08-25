// Pure helpers pulled out of MobileMenu.astro's inline script: the menu's link
// groups and the maths that parks the flying button in a corner.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { menuGroups } from '../src/lib/menu/menu-groups.ts';
import { cornerFrom } from '../src/components/menu/corner-from.ts';
import { fabXY } from '../src/components/menu/fab-xy.ts';
import { snapCorner } from '../src/components/menu/snap-corner.ts';
import { panelOffsets } from '../src/components/menu/panel-offsets.ts';
import type { MenuUi } from '../src/lib/menu/menu-groups.ts';

const ui: MenuUi = {
  menu: { events: 'Events', explore: 'Explore', more: 'More' },
  nav: {
    feed: 'Feed',
    calendar: 'Calendar',
    map: 'Map',
    landmarks: 'Landmarks',
    places: 'Places',
    bot: 'Bot',
    ical: 'iCal',
  },
  contribute: { link: 'Add your event' },
};
const view = { width: 400, height: 800 };

describe('menuGroups', () => {
  const groups = menuGroups('it', 'liguria', ui);
  test('is three sections, only the first offering favourites', () => {
    assert.deepEqual(
      groups.map((g) => g.label),
      ['Events', 'Explore', 'More'],
    );
    assert.deepEqual(
      groups.map((g) => g.favourites),
      [true, false, false],
    );
  });
  test('region links stay inside the locale and the region', () => {
    // /submit leads the group and is locale-free on purpose: one form, and the
    // page picks the language up from the shell.
    assert.deepEqual(
      groups[0]?.links.map((l) => l.href),
      ['/submit', '/it/liguria/', '/it/liguria/calendar/', '/it/liguria/map/'],
    );
  });
  test('the last section links out, untouched by the locale', () => {
    assert.deepEqual(
      groups[2]?.links.map((l) => l.href),
      [
        'https://t.me/dovego_bot',
        'https://liguria-events-bot.igor-ganov.workers.dev/calendar.ics',
      ],
    );
  });
});

describe('cornerFrom', () => {
  test('accepts the four corners', () => {
    assert.equal(cornerFrom('top-left'), 'top-left');
    assert.equal(cornerFrom('bottom-left'), 'bottom-left');
  });
  test('falls back to bottom-right for junk or nothing', () => {
    assert.equal(cornerFrom(undefined), 'bottom-right');
    assert.equal(cornerFrom('middle'), 'bottom-right');
  });
});

describe('fabXY', () => {
  test('insets the button by the margin on both of its edges', () => {
    assert.deepEqual(fabXY('top-left', 56, 16, view), { x: 16, y: 16 });
    assert.deepEqual(fabXY('bottom-right', 56, 16, view), { x: 328, y: 728 });
    assert.deepEqual(fabXY('top-right', 56, 16, view), { x: 328, y: 16 });
    assert.deepEqual(fabXY('bottom-left', 56, 16, view), { x: 16, y: 728 });
  });
});

describe('snapCorner', () => {
  test('picks the quadrant the pointer was released in', () => {
    assert.equal(snapCorner(10, 10, view), 'top-left');
    assert.equal(snapCorner(390, 10, view), 'top-right');
    assert.equal(snapCorner(10, 790, view), 'bottom-left');
    assert.equal(snapCorner(390, 790, view), 'bottom-right');
  });
  test('the exact centre stays top-left', () => {
    assert.equal(snapCorner(200, 400, view), 'top-left');
  });
});

describe('panelOffsets', () => {
  test('pins the popup to the button’s own two edges', () => {
    assert.deepEqual(panelOffsets('bottom-right', '16px', '80px'), {
      left: 'auto',
      right: '16px',
      top: 'auto',
      bottom: '80px',
    });
    assert.deepEqual(panelOffsets('top-left', '16px', '80px'), {
      left: '16px',
      right: 'auto',
      top: '80px',
      bottom: 'auto',
    });
  });
});

describe('the menu leads with making one', () => {
  const groups = menuGroups('it', 'liguria', ui);

  test('creating is the first link, above the feed', () => {
    // The header button is hidden with the nav on a phone; this is where the
    // same action lives there, and it is what the site is for.
    const [first] = groups[0]?.links ?? [];
    assert.equal(first?.href, '/submit');
    assert.equal(first?.label, 'Add your event');
  });

  test('it is reachable without an account, like the page it opens', () => {
    assert.ok((groups[0]?.links ?? []).some((link) => link.href === '/submit'));
  });
});
