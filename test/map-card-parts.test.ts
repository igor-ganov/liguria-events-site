import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { DEFAULT_UI } from '../src/lib/i18n/defaults/default-ui.ts';
import { eventCard } from '../src/components/map/event-card.ts';
import { isCategory } from '../src/lib/events/is-category.ts';
import { landmarkCard } from '../src/components/map/landmark-card.ts';
import { landmarkPath } from '../src/lib/landmarks/landmark-path.ts';
import { placeCard } from '../src/components/map/place-card.ts';
import { placePath } from '../src/lib/places/place-path.ts';
import { toastText } from '../src/lib/map/map-toasts.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { Landmark } from '../src/lib/landmarks/landmark-schema.ts';
import type { Place } from '../src/lib/places/place-schema.ts';

const event = (over: Partial<CompactEvent>): CompactEvent => ({
  id: 'abc',
  t: 'Festa',
  s: '2026-08-20',
  c: ['music'],
  u: 'https://example.test/abc',
  ...over,
});

const landmark = (over: Partial<Landmark>): Landmark => ({
  id: 'l1',
  name: 'Lanterna',
  lat: 44.4,
  lng: 8.9,
  kind: 'lighthouse',
  region: 'liguria',
  ...over,
});

const place = (over: Partial<Place>): Place => ({
  id: 'p1',
  name: 'Trattoria',
  lat: 44.4,
  lng: 8.9,
  cat: 'restaurant',
  region: 'liguria',
  ...over,
});

describe('isCategory', () => {
  test('accepts a known category', () => {
    assert.equal(isCategory('music'), true);
    assert.equal(isCategory('other'), true);
  });
  test('rejects an unknown value instead of folding it into other', () => {
    assert.equal(isCategory('opera'), false);
    assert.equal(isCategory(''), false);
    assert.equal(isCategory(undefined), false);
  });
});

describe('eventCard', () => {
  test('carries the localized link, image, title and date span', () => {
    const card = eventCard('en')(event({ img: 'https://img/a.jpg', h: '21:00' }));
    assert.deepEqual(card, {
      href: '/event/abc/',
      image: 'https://img/a.jpg',
      title: 'Festa',
      when: '20.08 · 21:00',
    });
  });
  test('prefixes the path for a non-default locale', () => {
    assert.equal(eventCard('it')(event({})).href, '/it/event/abc/');
  });
  test('prefers the translated title when the locale has one', () => {
    // A localized title carries every locale; only the Russian one is asserted.
    const card = eventCard('ru')(event({ tl: { en: 'Festival', it: 'Festa', ru: 'Праздник' } }));
    assert.equal(card.title, 'Праздник');
  });
  test('leaves the image undefined when the event has none', () => {
    assert.equal(eventCard('en')(event({})).image, undefined);
  });
});

describe('landmarkCard', () => {
  const card = landmarkCard('en', DEFAULT_UI);

  test('resolves the link, kind badge, title and blurb', () => {
    const built = card(landmark({ desc: 'A tower.' }));
    assert.equal(built.href, `/${landmarkPath('liguria', 'Lanterna', 'l1')}`);
    assert.equal(built.kindLabel, DEFAULT_UI.landmarks.kinds['lighthouse']);
    assert.equal(built.title, 'Lanterna');
    assert.equal(built.desc, 'A tower.');
    assert.ok(built.kindIcon.includes('<svg'));
    assert.ok(built.kindColor.startsWith('#'));
  });

  test('routes a Commons photo through Special:FilePath at card width', () => {
    const built = card(landmark({ img: 'https://commons.wikimedia.org/wiki/Special:FilePath/L.jpg' }));
    assert.ok(built.image?.includes('240'));
  });

  test('leaves the photo out when the landmark has none', () => {
    assert.equal(card(landmark({})).image, undefined);
  });

  test('lists the sources the landmark was built from', () => {
    const built = card(landmark({ wiki: 'https://en.wikipedia.org/wiki/Lanterna', wd: 'Q123' }));
    assert.ok(built.sources.length > 0);
  });

  test('prefixes the link for a non-default locale', () => {
    assert.ok(landmarkCard('it', DEFAULT_UI)(landmark({})).href.startsWith('/it/'));
  });
});

describe('placeCard', () => {
  const card = placeCard('en', DEFAULT_UI);

  test('resolves the link, category badge and title', () => {
    const built = card(place({}));
    assert.equal(built.href, `/${placePath('liguria', 'Trattoria', 'p1')}`);
    assert.equal(built.kindLabel, DEFAULT_UI.places.categories['restaurant']);
    assert.equal(built.title, 'Trattoria');
  });

  test('passes the hours and phone into the facts block with their labels', () => {
    const built = card(place({ hours: 'Mo-Fr 09:00-18:00', phone: '+39 010 1234' }));
    assert.equal(built.facts.hours, 'Mo-Fr 09:00-18:00');
    assert.equal(built.facts.phone, '+39 010 1234');
    assert.equal(built.facts.hoursLabel, DEFAULT_UI.places.hours);
    assert.equal(built.facts.phoneLabel, DEFAULT_UI.places.phone);
    assert.ok(built.facts.hoursIcon.includes('<svg'));
    assert.ok(built.facts.phoneIcon.includes('<svg'));
  });

  test('leaves both facts undefined when the place carries neither', () => {
    const built = card(place({}));
    assert.equal(built.facts.hours, undefined);
    assert.equal(built.facts.phone, undefined);
  });

  test('shows at most three source chips — the detail page has the rest', () => {
    const built = card(
      place({
        website: 'https://a.test',
        wiki: 'https://en.wikipedia.org/wiki/A',
        wd: 'Q1',
        socials: ['https://instagram.com/a', 'https://facebook.com/a'],
      }),
    );
    assert.ok(built.sources.length <= 3);
  });
});

describe('toastText', () => {
  test('answers in the viewed language', () => {
    assert.ok(toastText('outside', 'it').includes('mappa'));
    assert.ok(toastText('denied', 'en').includes('blocked'));
  });
  test('falls back to English for a language it has no copy for', () => {
    assert.equal(toastText('error', 'de'), toastText('error', 'en'));
  });
  test('covers every key the map can raise', () => {
    (['outside', 'denied', 'error', 'zoomIn'] as const).forEach((key) => {
      assert.notEqual(toastText(key, 'en'), '');
    });
  });
});
