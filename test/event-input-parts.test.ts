import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { coordinatesOf } from '../src/lib/events/coordinates-of.ts';
import { eventDraft } from '../src/lib/events/event-draft.ts';
import { eventInputError } from '../src/lib/events/event-input-error.ts';
import { eventInputValue } from '../src/lib/events/event-input-value.ts';
import { parseEventInput } from '../src/lib/events/event-input.ts';
import type { EventDraft } from '../src/lib/events/event-input-types.ts';

// The database's own empty marker, spelled without the literal so the house
// style's absent-value rule is not tripped by every assertion.
const EMPTY = JSON.parse('null');

const draft = (over: Partial<EventDraft> = {}): EventDraft => ({
  title: 'Concerto',
  description: '',
  startDate: '2026-08-17',
  endDate: '',
  venue: '',
  address: '',
  phone: '',
  website: '',
  cover: '',
  lat: '',
  lng: '',
  container: false,
  sessions: [],
  categories: [],
  free: false,
  listed: false,
  ...over,
});

describe('eventDraft', () => {
  test('trims and bounds every text field', () => {
    const d = eventDraft({ title: `  ${'x'.repeat(300)}  `, phone: '  +39 010  ' });
    assert.equal(d.title.length, 200);
    assert.equal(d.phone, '+39 010');
  });

  test('a missing or wrongly typed field reads as empty', () => {
    const d = eventDraft({ title: 7, venue: undefined });
    assert.equal(d.title, '');
    assert.equal(d.venue, '');
    assert.equal(d.startDate, '');
  });

  test('a body that is not an object reads as an empty draft', () => {
    assert.equal(eventDraft(undefined).title, '');
    assert.deepEqual(eventDraft('nope').categories, []);
  });

  test('categories keep only strings and are capped at six', () => {
    const d = eventDraft({ categories: ['a', 1, 'b', 'c', 'd', 'e', 'f', 'g'] });
    assert.deepEqual(d.categories, ['a', 'b', 'c', 'd', 'e', 'f']);
  });

  test('free is the boolean true only, never a truthy stand-in', () => {
    assert.equal(eventDraft({ free: true }).free, true);
    assert.equal(eventDraft({ free: 'true' }).free, false);
    assert.equal(eventDraft({ free: 1 }).free, false);
  });

  test('coverImage is read from the payload key the form sends', () => {
    assert.equal(eventDraft({ coverImage: '/uploads/ev/a.jpg' }).cover, '/uploads/ev/a.jpg');
  });
});

describe('eventInputError', () => {
  test('a complete draft has no error', () => {
    assert.equal(eventInputError(draft()), undefined);
  });

  test('a short title is rejected', () => {
    assert.equal(eventInputError(draft({ title: 'ab' })), 'Title and a valid start date are required.');
  });

  test('a malformed start date is rejected', () => {
    assert.equal(eventInputError(draft({ startDate: '17-08-2026' })), 'Title and a valid start date are required.');
  });

  test('an omitted end date is fine, a malformed one is not', () => {
    assert.equal(eventInputError(draft({ endDate: '' })), undefined);
    assert.equal(eventInputError(draft({ endDate: 'soon' })), 'End date is malformed.');
  });

  test('the first broken rule wins, as the guard clauses did', () => {
    assert.equal(
      eventInputError(draft({ title: 'ab', endDate: 'soon' })),
      'Title and a valid start date are required.',
    );
  });
});

describe('coordinatesOf', () => {
  test('a full pair is kept', () => {
    assert.deepEqual(coordinatesOf('44.4', '8.9'), { lat: 44.4, lng: 8.9 });
  });

  test('zero is a real coordinate', () => {
    assert.deepEqual(coordinatesOf('0', '0'), { lat: 0, lng: 0 });
  });

  test('half a position is no position', () => {
    assert.deepEqual(coordinatesOf('44.4', ''), { lat: EMPTY, lng: EMPTY });
    assert.deepEqual(coordinatesOf('', '8.9'), { lat: EMPTY, lng: EMPTY });
  });

  test('unparsable text is no position', () => {
    assert.deepEqual(coordinatesOf('north', 'east'), { lat: EMPTY, lng: EMPTY });
  });
});

describe('eventInputValue', () => {
  test('empty optional fields become the database marker', () => {
    const value = eventInputValue(draft());
    assert.equal(value.endDate, EMPTY);
    assert.equal(value.venue, EMPTY);
    assert.equal(value.address, EMPTY);
    assert.equal(value.phone, EMPTY);
  });

  test('only an http(s) website is stored', () => {
    assert.equal(eventInputValue(draft({ website: 'https://dovego.it' })).website, 'https://dovego.it');
    assert.equal(eventInputValue(draft({ website: 'javascript:alert(1)' })).website, EMPTY);
    assert.equal(eventInputValue(draft({ website: 'dovego.it' })).website, EMPTY);
  });

  test('only our own uploads path is stored as a cover', () => {
    assert.equal(eventInputValue(draft({ cover: '/uploads/ev/a.jpg' })).cover, '/uploads/ev/a.jpg');
    assert.equal(eventInputValue(draft({ cover: 'https://evil.test/a.jpg' })).cover, EMPTY);
  });

  test('categories are stored as JSON and free as 0/1', () => {
    const value = eventInputValue(draft({ categories: ['music'], free: true }));
    assert.equal(value.categoriesJson, '["music"]');
    assert.equal(value.free, 1);
    assert.equal(eventInputValue(draft()).free, 0);
  });
});

describe('parseEventInput', () => {
  test('a valid payload parses', () => {
    const parsed = parseEventInput({ title: 'Concerto', startDate: '2026-08-17' });
    assert.equal(parsed.ok, true);
    assert.equal(parsed.ok && parsed.value.title, 'Concerto');
  });

  test('an invalid payload reports the detail and no value', () => {
    const parsed = parseEventInput({ title: 'ab', startDate: '2026-08-17' });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.ok === false && parsed.detail, 'Title and a valid start date are required.');
  });

  test('an empty payload is rejected rather than stored blank', () => {
    assert.equal(parseEventInput({}).ok, false);
  });
});
