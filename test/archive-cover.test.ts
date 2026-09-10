// A page whose event is over keeps working, and says so with more than words:
// the photograph of a night that has happened is replaced by one shared
// picture that means "archive" wherever it appears.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { ARCHIVE_COVER } from '../src/lib/events/archive-cover-url.ts';
import { archivedCover } from '../src/lib/events/archive-cover.ts';
import type { GalleryPhoto } from '../src/lib/events/event-gallery.ts';

const photo: GalleryPhoto = {
  image: 'https://www.mentelocale.it/repository/136204_half.jpg',
  name: 'mentelocale',
  href: 'https://www.mentelocale.it/genova/136204.htm',
};

describe('archivedCover', () => {
  test('an event still to come keeps its own photograph', () => {
    assert.deepEqual(archivedCover([photo], false), [photo]);
  });

  test('an event that is over wears the shared picture instead', () => {
    const [cover, ...rest] = archivedCover([photo, { ...photo, image: 'https://x/2.jpg' }], true);
    assert.equal(cover?.image, ARCHIVE_COVER);
    // No gallery of a night that has passed, and no attribution: the picture
    // is ours, and crediting a newspaper for it would be a lie.
    assert.deepEqual(rest, []);
    assert.equal(cover?.name, '');
    assert.equal(cover?.href, '');
  });

  test('an event with no photograph at all still gets the archive picture', () => {
    // Otherwise the page that most needs the mark is the one without it.
    assert.equal(archivedCover([], true).at(0)?.image, ARCHIVE_COVER);
  });

  test('and one with no photograph that is still to come gets nothing', () => {
    assert.deepEqual(archivedCover([], false), []);
  });
});
