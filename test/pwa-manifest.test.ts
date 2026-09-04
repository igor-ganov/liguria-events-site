// The manifest is what turns the site into something Android will install, and
// it is also the contract the TWA wrapper reads: Bubblewrap takes the name, the
// icons and the theme colour straight out of it, and a store listing built on a
// manifest that lies is a store listing nobody can fix without a new release.
// So the fields the wrapper depends on are pinned here, not left to a reviewer.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { appManifest } from '../src/lib/pwa/app-manifest.ts';
import { MANIFEST_ICONS } from '../src/lib/pwa/manifest-icons.ts';

const manifest = appManifest();

describe('appManifest', () => {
  test('is installable: a scope, a start inside it, and a standalone display', () => {
    assert.equal(manifest.scope, '/');
    assert.ok(manifest.start_url.startsWith(manifest.scope), manifest.start_url);
    assert.equal(manifest.display, 'standalone');
    // The id is what keeps an installed app pointing at this app across a
    // future change of start_url — without it the browser derives one from
    // start_url, and moving the start page orphans every installation.
    assert.equal(manifest.id, '/');
  });

  test('names the app the way the store listing will', () => {
    assert.equal(manifest.short_name, 'Dove Go');
    assert.ok(manifest.short_name.length <= 12, 'short_name is truncated on a launcher past 12 characters');
    assert.ok(manifest.name.startsWith('Dove Go'));
    assert.ok(manifest.description.length > 30);
    assert.equal(manifest.lang, 'en');
  });

  test('carries the colours the splash screen is painted with', () => {
    // The light theme-color the head already declares. A splash screen painted
    // in a colour the first frame does not use is the flash everybody notices.
    assert.equal(manifest.background_color, '#fbfaf7');
    assert.equal(manifest.theme_color, '#fbfaf7');
  });

  test('has the two icon sizes Android requires, and a maskable one', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes);
    assert.ok(sizes.includes('192x192'), sizes.join(' '));
    assert.ok(sizes.includes('512x512'), sizes.join(' '));
    const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
    assert.equal(maskable.length, 1);
    assert.equal(maskable.at(0)?.sizes, '512x512');
  });

  test('every icon is a same-origin absolute path to a png', () => {
    MANIFEST_ICONS.forEach((icon) => {
      assert.ok(icon.src.startsWith('/icons/'), icon.src);
      assert.equal(icon.type, 'image/png');
    });
  });

  test('the shortcuts lead where the app is for: making an event, the map, saved', () => {
    const urls = manifest.shortcuts.map((shortcut) => shortcut.url);
    assert.deepEqual(urls, ['/submit/', '/map', '/favorites/']);
    manifest.shortcuts.forEach((shortcut) => {
      assert.ok(shortcut.url.startsWith('/'), shortcut.url);
      assert.ok(shortcut.name.length > 0);
    });
  });
});
