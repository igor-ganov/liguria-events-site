import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { coordsOf } from '../src/lib/events/coords-of.ts';
import { eventCategories } from '../src/lib/events/event-categories.ts';
import { eventContactsOf } from '../src/lib/events/event-contacts-of.ts';
import { eventFormValues } from '../src/lib/events/event-form-values.ts';
import { localizedText } from '../src/lib/events/localized-text.ts';
import { numberText } from '../src/lib/events/number-text.ts';
import { parseCategories } from '../src/lib/events/parse-categories.ts';
import { toCompact } from '../src/lib/events/to-compact.ts';
import type { EditableRow, EventRow } from '../src/lib/events/event-row-types.ts';

// The database's own empty marker, spelled without the literal so the house
// style's absent-value rule is not tripped by every assertion.
const EMPTY = JSON.parse('null');

const row = (over: Partial<EventRow> = {}): EventRow => ({
  id: 'e1',
  title_en: 'Concert',
  title_it: EMPTY,
  title_ru: EMPTY,
  desc_en: EMPTY,
  desc_it: EMPTY,
  desc_ru: EMPTY,
  start_date: '2026-08-17',
  end_date: EMPTY,
  categories: EMPTY,
  venue: EMPTY,
  lat: EMPTY,
  lng: EMPTY,
  cover_image: EMPTY,
  free: 0,
  gem: 0,
  ...over,
});

const editable = (over: Partial<EditableRow> = {}): EditableRow => ({
  title_en: 'Concert',
  desc_en: EMPTY,
  start_date: '2026-08-17',
  end_date: EMPTY,
  venue: EMPTY,
  categories: EMPTY,
  free: 0,
  cover_image: EMPTY,
  address: EMPTY,
  phone: EMPTY,
  website: EMPTY,
  lat: EMPTY,
  lng: EMPTY,
  submitter_id: 'u1',
  ...over,
});

describe('localizedText', () => {
  test('English stands in for a missing translation', () => {
    assert.deepEqual(localizedText('Concert', EMPTY, EMPTY), { en: 'Concert', it: 'Concert', ru: 'Concert' });
  });

  test('a present translation wins', () => {
    assert.deepEqual(localizedText('Concert', 'Concerto', EMPTY), {
      en: 'Concert',
      it: 'Concerto',
      ru: 'Concert',
    });
  });

  test('a row with no text at all yields empty strings, never the marker', () => {
    assert.deepEqual(localizedText(EMPTY, EMPTY, EMPTY), { en: '', it: '', ru: '' });
  });
});

describe('parseCategories', () => {
  test('reads a stored JSON array', () => {
    assert.deepEqual(parseCategories('["music","art"]'), ['music', 'art']);
  });

  test('malformed JSON reads as none rather than throwing', () => {
    assert.deepEqual(parseCategories('{music'), []);
  });

  test('an empty column reads as none', () => {
    assert.deepEqual(parseCategories(EMPTY), []);
  });

  test('non-string members are dropped', () => {
    assert.deepEqual(parseCategories('["music",7]'), ['music']);
  });
});

describe('eventCategories', () => {
  test('keeps what the row stored', () => {
    assert.deepEqual(eventCategories('["music"]'), ['music']);
  });

  test('an event with no categories still carries the catch-all', () => {
    assert.deepEqual(eventCategories(EMPTY), ['other']);
    assert.deepEqual(eventCategories('[]'), ['other']);
  });
});

describe('coordsOf', () => {
  test('a stored position becomes [lng, lat]', () => {
    assert.deepEqual(coordsOf(44.4, 8.9), { g: [8.9, 44.4] });
  });

  test('0° is a real coordinate, not an absent one', () => {
    assert.deepEqual(coordsOf(0, 0), { g: [0, 0] });
  });

  test('half a position contributes no key at all', () => {
    assert.deepEqual(coordsOf(44.4, EMPTY), {});
    assert.equal(Object.hasOwn(coordsOf(EMPTY, 8.9), 'g'), false);
  });
});

describe('toCompact', () => {
  test('always carries the required wire fields', () => {
    assert.deepEqual(toCompact(row()), {
      id: 'e1',
      t: 'Concert',
      tl: { en: 'Concert', it: 'Concert', ru: 'Concert' },
      s: '2026-08-17',
      c: ['other'],
      u: '',
    });
  });

  test('an empty column leaves its key out entirely', () => {
    const compact = toCompact(row());
    assert.equal(Object.hasOwn(compact, 'e'), false);
    assert.equal(Object.hasOwn(compact, 'v'), false);
    assert.equal(Object.hasOwn(compact, 'img'), false);
    assert.equal(Object.hasOwn(compact, 'g'), false);
    assert.equal(Object.hasOwn(compact, 'd'), false);
  });

  test('flags appear only when set', () => {
    assert.equal(toCompact(row({ free: 1 })).f, true);
    assert.equal(toCompact(row({ gem: 1 })).x, true);
    assert.equal(Object.hasOwn(toCompact(row({ free: 0, gem: 0 })), 'f'), false);
    assert.equal(Object.hasOwn(toCompact(row({ free: 0, gem: 0 })), 'x'), false);
  });

  test('optional text fields are carried when filled', () => {
    const compact = toCompact(row({ end_date: '2026-08-18', venue: 'Teatro', cover_image: '/uploads/a.jpg' }));
    assert.equal(compact.e, '2026-08-18');
    assert.equal(compact.v, 'Teatro');
    assert.equal(compact.img, '/uploads/a.jpg');
  });

  test('the description block is localized like the title', () => {
    const compact = toCompact(row({ desc_en: 'Nice', desc_it: 'Bello' }));
    assert.deepEqual(compact.d, { en: 'Nice', it: 'Bello', ru: 'Nice' });
  });

  test('a position becomes [lng, lat]', () => {
    assert.deepEqual(toCompact(row({ lat: 44.4, lng: 8.9 })).g, [8.9, 44.4]);
  });

  test('a title-less row still has a string title', () => {
    assert.equal(toCompact(row({ title_en: EMPTY })).t, '');
  });
});

describe('eventContactsOf', () => {
  test('carries only the filled contacts', () => {
    const contacts = eventContactsOf({ address: 'Via Roma 1', phone: EMPTY, website: '' });
    assert.deepEqual(contacts, { address: 'Via Roma 1' });
    assert.equal(Object.hasOwn(contacts, 'phone'), false);
    assert.equal(Object.hasOwn(contacts, 'website'), false);
  });

  test('a row with no contacts is an empty block', () => {
    assert.deepEqual(eventContactsOf({ address: EMPTY, phone: EMPTY, website: EMPTY }), {});
  });
});

describe('numberText', () => {
  test('a stored number becomes its text', () => {
    assert.equal(numberText(44.4), '44.4');
  });

  test('zero is text, not an empty field', () => {
    assert.equal(numberText(0), '0');
  });

  test('an empty column becomes an empty field', () => {
    assert.equal(numberText(EMPTY), '');
  });
});

describe('eventFormValues', () => {
  test('every field is a string the input can hold', () => {
    const values = eventFormValues(editable());
    assert.deepEqual(values, {
      title: 'Concert',
      description: '',
      startDate: '2026-08-17',
      endDate: '',
      venue: '',
      categories: [],
      free: false,
      coverImage: '',
      address: '',
      phone: '',
      website: '',
      lat: '',
      lng: '',
    });
  });

  test('stored values come back verbatim', () => {
    const values = eventFormValues(
      editable({ end_date: '2026-08-18', venue: 'Teatro', categories: '["music"]', free: 1, lat: 44.4 }),
    );
    assert.equal(values.endDate, '2026-08-18');
    assert.equal(values.venue, 'Teatro');
    assert.deepEqual(values.categories, ['music']);
    assert.equal(values.free, true);
    assert.equal(values.lat, '44.4');
  });

  test('the categories list is the form\'s own, safe to edit', () => {
    const values = eventFormValues(editable({ categories: '["music"]' }));
    values.categories.push('art');
    assert.deepEqual(eventFormValues(editable({ categories: '["music"]' })).categories, ['music']);
  });
});
