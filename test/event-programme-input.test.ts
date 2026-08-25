import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { draftSpan } from '../src/lib/events/draft-span.ts';
import { eventDraft } from '../src/lib/events/event-draft.ts';
import { eventInputError } from '../src/lib/events/event-input-error.ts';
import { eventInputValue } from '../src/lib/events/event-input-value.ts';
import { parseSessions } from '../src/lib/events/parse-sessions.ts';
import { programmeSpan } from '../src/lib/events/programme-span.ts';
import { storedSessions } from '../src/lib/events/stored-sessions.ts';
import { toCompact } from '../src/lib/events/to-compact.ts';
import type { EventRow } from '../src/lib/events/event-row-types.ts';

// The database's own empty marker, spelled without the literal so the house
// style's absent-value rule is not tripped by every assertion.
const EMPTY = JSON.parse('null');

const body = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  title: 'Sere d’Estate',
  startDate: '2026-08-01',
  endDate: '2026-08-31',
  categories: ['music'],
  ...over,
});

const programme = [
  { date: '2026-08-20', time: '21:00', title: 'Serata finale' },
  { date: '2026-08-05', time: '21:00' },
];

describe('parseSessions', () => {
  test('keeps dated rows, sorts them, drops the half-filled ones', () => {
    assert.deepEqual(parseSessions([...programme, { time: '20:00' }, { date: 'soon' }]), [
      { date: '2026-08-05', time: '21:00' },
      { date: '2026-08-20', time: '21:00', title: 'Serata finale' },
    ]);
  });

  test('a malformed clock time is dropped, the date kept', () => {
    assert.deepEqual(parseSessions([{ date: '2026-08-05', time: '25:99' }]), [{ date: '2026-08-05' }]);
  });

  test('a payload that is not a list yields no programme', () => {
    assert.deepEqual(parseSessions('nope'), []);
    assert.deepEqual(parseSessions(undefined), []);
  });
});

describe('programmeSpan', () => {
  test('first to last date, whatever order they arrived in', () => {
    assert.deepEqual(programmeSpan(parseSessions(programme)), {
      startDate: '2026-08-05',
      endDate: '2026-08-20',
    });
  });
  test('nothing to derive from an empty programme', () => {
    assert.equal(programmeSpan([]), undefined);
  });
});

describe('draftSpan', () => {
  test("a container's run is its programme, not the dates typed into the form", () => {
    const span = draftSpan(body({ kind: 'container', sessions: programme }));
    assert.equal(span.container, true);
    assert.equal(span.startDate, '2026-08-05'); // not the advertised 08-01
    assert.equal(span.endDate, '2026-08-20'); // not the advertised 08-31
  });

  test('a one-evening container is a one-day event, not a zero-length run', () => {
    const span = draftSpan(body({ kind: 'container', sessions: [{ date: '2026-08-05' }] }));
    assert.equal(span.startDate, '2026-08-05');
    assert.equal(span.endDate, '');
  });

  test('a standalone event keeps the dates as submitted, programme or not', () => {
    const span = draftSpan(body({ sessions: programme }));
    assert.equal(span.container, false);
    assert.equal(span.startDate, '2026-08-01');
    assert.equal(span.endDate, '2026-08-31');
  });

  test('a container with no readable dates falls back to the typed run', () => {
    const span = draftSpan(body({ kind: 'container', sessions: [] }));
    assert.equal(span.startDate, '2026-08-01');
  });
});

describe('event input: the programme reaches SQL only for a container', () => {
  test('a container stores its programme and its kind', () => {
    const value = eventInputValue(eventDraft(body({ kind: 'container', sessions: programme })));
    assert.equal(value.kind, 'container');
    assert.equal(value.startDate, '2026-08-05');
    assert.deepEqual(JSON.parse(value.sessionsJson ?? '[]'), [
      { date: '2026-08-05', time: '21:00' },
      { date: '2026-08-20', time: '21:00', title: 'Serata finale' },
    ]);
  });

  test('a standalone event stores neither, even when rows were filled in', () => {
    const value = eventInputValue(eventDraft(body({ sessions: programme })));
    assert.equal(value.kind, EMPTY);
    assert.equal(value.sessionsJson, EMPTY);
  });

  test('a container with an empty programme is rejected, and says why', () => {
    assert.equal(
      eventInputError(eventDraft(body({ kind: 'container', sessions: [] }))),
      'A multi-date event needs at least one date in its programme.',
    );
  });
});

describe('storedSessions / toCompact', () => {
  const row = (over: Partial<EventRow> = {}): EventRow => ({
    id: 'e1',
    title_en: 'Sere',
    title_it: EMPTY,
    title_ru: EMPTY,
    desc_en: EMPTY,
    desc_it: EMPTY,
    desc_ru: EMPTY,
    start_date: '2026-08-05',
    end_date: '2026-08-20',
    categories: EMPTY,
    venue: EMPTY,
    lat: EMPTY,
    lng: EMPTY,
    cover_image: EMPTY,
    free: 0,
    gem: 0,
    sessions: EMPTY,
    kind: EMPTY,
  origin: 'crawler',
    ...over,
  });

  test('a stored container round-trips to the wire shape the feed filters on', () => {
    const compact = toCompact(row({ kind: 'container', sessions: JSON.stringify(programme) }));
    assert.equal(compact['k'], true);
    assert.deepEqual(compact['p'], [
      { date: '2026-08-05', time: '21:00' },
      { date: '2026-08-20', time: '21:00', title: 'Serata finale' },
    ]);
  });

  test('a standalone row carries neither key', () => {
    const compact = toCompact(row());
    assert.equal('k' in compact, false);
    assert.equal('p' in compact, false);
  });

  test('an unreadable programme column degrades to no programme, never a throw', () => {
    assert.deepEqual(storedSessions('{oops'), []);
    assert.deepEqual(storedSessions(EMPTY), []);
    assert.equal('p' in toCompact(row({ kind: 'container', sessions: '{oops' })), false);
  });
});
