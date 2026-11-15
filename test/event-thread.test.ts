// The event page as one thread of knots: when, where, how much. These are the
// pure parts every knot is drawn from — the day and the hour, the run of a
// weekly event, the month calendar of its sessions, the price.
import { describe, expect, test } from 'bun:test';
import { placeLines } from '../src/lib/events/thread/place-lines.ts';
import { cellMark } from '../src/lib/events/thread/cell-mark.ts';
import { listedLeaves } from '../src/lib/events/thread/listed-leaves.ts';
import { townOnward } from '../src/lib/events/thread/town-onward.ts';
import { priceLine } from '../src/lib/events/thread/price-line.ts';
import { runSummary } from '../src/lib/events/thread/run-summary.ts';
import { runText } from '../src/lib/events/thread/run-text.ts';
import { sessionCalendar } from '../src/lib/events/thread/session-calendar.ts';
import { sessionDays } from '../src/lib/events/thread/session-days.ts';
import { threadWhen } from '../src/lib/events/thread/thread-when.ts';
import { whenLine } from '../src/lib/events/thread/when-line.ts';
import type { CalendarCell } from '../src/lib/events/thread/calendar-types.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-11-15';

// Every Thursday from 1 October 2026 to 29 April 2027: 31 meetings.
const THURSDAYS: readonly string[] = Array.from({ length: 31 }, (_, week) =>
  new Date(Date.UTC(2026, 9, 1 + week * 7)).toISOString().slice(0, 10),
);

const KNITTING: CompactEvent = {
  id: 'knit',
  t: 'Maglia insieme',
  s: '2026-10-01',
  e: '2027-04-29',
  c: ['workshop'],
  u: 'https://example.test/knit',
  h: '15:30',
  du: 150,
  f: true,
  k: true,
  p: THURSDAYS.map((date) => ({ date, time: '15:30' })),
};

const RECITAL: CompactEvent = { id: 'bach', t: 'Bach', s: TODAY, c: ['music'], u: 'https://example.test/bach', h: '17:00' };

const LABELS = {
  today: 'today',
  oneDate: 'One date only',
  datesCount: '{count} dates',
  left: '{left} of {total} left',
  more: '+{count} more, until',
  free: 'Free',
  from: 'from',
  priceUnknown: 'Price not listed',
};

type Day = Extract<CalendarCell, { kind: 'day' }>;
const isDay = (cell: CalendarCell): cell is Day => cell.kind === 'day';

const marks = (cells: readonly CalendarCell[]): readonly string[] =>
  cells.flatMap((cell) => [cell].filter(isDay).map((day) => `${day.day}:${day.mark}`));

describe('sessionDays', () => {
  test('a programme is its days, once each, in order', () => {
    const event: CompactEvent = { ...KNITTING, p: [{ date: '2026-11-26' }, { date: '2026-11-19', time: '10:00' }, { date: '2026-11-19', time: '15:00' }] };
    expect(sessionDays(event)).toEqual(['2026-11-19', '2026-11-26']);
  });
});

describe('cellMark', () => {
  test('a day carries its mark, a blank carries none', () => {
    expect(cellMark({ kind: 'day', iso: '2026-11-19', day: 19, mark: 'next' })).toBe('next');
    expect(cellMark({ kind: 'blank' })).toBeUndefined();
  });
});

describe('sessionCalendar', () => {
  const months = sessionCalendar(THURSDAYS, TODAY);
  test('three months, opening on the month of the next session', () => {
    expect(months.map((month) => month.month)).toEqual(['2026-11', '2026-12', '2027-01']);
  });
  test('weeks start on Monday, so 1 November 2026, a Sunday, has six blanks before it', () => {
    const first = months[0]?.weeks[0] ?? [];
    expect(first.length).toBe(7);
    expect(first.filter((cell) => cell.kind === 'blank').length).toBe(6);
  });
  test('the sessions gone are crossed, the next is filled, the rest are ringed', () => {
    const november = (months[0]?.weeks ?? []).flat().filter((cell) => cell.kind === 'day' && cell.mark !== 'off');
    expect(marks(november)).toEqual(['5:gone', '12:gone', '19:next', '26:on']);
  });
  test('a day with no session is plain', () => {
    const cell = (months[0]?.weeks ?? []).flat().find((one) => one.kind === 'day' && one.day === 18);
    expect(cell).toEqual({ kind: 'day', iso: '2026-11-18', day: 18, mark: 'off' });
  });
  test('no month past the last session is drawn', () => {
    expect(sessionCalendar(['2026-11-19', '2026-11-26'], TODAY).map((month) => month.month)).toEqual(['2026-11']);
  });
  test('a run that is over shows its last month, every session crossed', () => {
    const over = sessionCalendar(['2026-10-01', '2026-10-08'], TODAY);
    expect(over.map((month) => month.month)).toEqual(['2026-10']);
    expect(marks((over[0]?.weeks ?? []).flat().filter((cell) => cell.kind === 'day' && cell.mark !== 'off'))).toEqual(['1:gone', '8:gone']);
  });
});

describe('runSummary', () => {
  test('counts the run, what is left of it, and names its weekday', () => {
    const run = runSummary(THURSDAYS, TODAY);
    expect([run.total, run.left, run.upcoming[0], run.weekday, run.last]).toEqual([31, 24, '2026-11-19', 3, '2027-04-29']);
  });
  test('a fortnightly run on Thursdays is not every Thursday', () => {
    expect(runSummary(['2026-11-19', '2026-12-03', '2026-12-17', '2026-12-31'], TODAY).weekday).toBeUndefined();
  });
  test('a weekly run that skips a holiday week is still weekly', () => {
    expect(runSummary(['2026-11-19', '2026-11-26', '2026-12-03', '2026-12-17', '2026-12-24'], TODAY).weekday).toBe(3);
  });
  test('dates on different weekdays have no weekday', () => {
    expect(runSummary(['2026-11-19', '2026-11-21', '2026-11-26'], TODAY).weekday).toBeUndefined();
  });
});

describe('runText', () => {
  const run = runSummary(THURSDAYS, TODAY);
  test('a weekly run says its day, and how many are left', () => {
    const text = runText('en', LABELS)(run);
    expect([text.line, text.left]).toEqual(['Every Thursday', '24 of 31 left']);
  });
  test('the same in Italian and Russian', () => {
    expect(runText('it', LABELS)(run).line).toBe('Ogni giovedì');
    expect(runText('ru', LABELS)(run).line).toBe('По четвергам');
  });
  test('the next four dates, then how many more and until when', () => {
    const text = runText('en', LABELS)(run);
    expect(text.dates.map((date) => date.text)).toEqual(['Thu 19 Nov', 'Thu 26 Nov', 'Thu 3 Dec', 'Thu 10 Dec']);
    expect(text.dates[0]?.iso).toBe('2026-11-19');
    expect(text.more).toEqual({ text: '+20 more, until', iso: '2027-04-29', date: '29 Apr' });
  });
  test('a run with no weekday counts its dates', () => {
    expect(runText('en', LABELS)(runSummary(['2026-11-19', '2026-11-21'], TODAY)).line).toBe('2 dates');
  });
  test('nothing more to say when every date is shown', () => {
    expect(runText('en', LABELS)(runSummary(['2026-11-19', '2026-11-21'], TODAY)).more).toBeUndefined();
  });
});

describe('whenLine', () => {
  test('the day, the hour, and the end worked out from how long it lasts', () => {
    expect(whenLine('en')({ day: '2026-11-19', start: '15:30', minutes: 150, today: TODAY })).toEqual({
      iso: '2026-11-19',
      text: 'Thu, 19 November',
      isToday: false,
      start: '15:30',
      end: '18:00',
      duration: '2h 30m',
    });
  });
  test('today is said, and an end nobody gave is not made up', () => {
    const line = whenLine('en')({ day: TODAY, start: '17:00', minutes: undefined, today: TODAY });
    expect([line.isToday, line.end, line.duration]).toEqual([true, undefined, undefined]);
  });
  test('an evening that runs past midnight ends the next morning', () => {
    expect(whenLine('en')({ day: TODAY, start: '22:30', minutes: 180, today: TODAY }).end).toBe('01:30');
  });
});

describe('threadWhen', () => {
  test('a single date is one date only, with no run and no calendar', () => {
    const when = threadWhen('en', LABELS)(RECITAL, TODAY);
    expect([when.line.text, when.line.isToday, when.once, when.run, when.calendar.length]).toEqual(['Sun, 15 November', true, 'One date only', undefined, 0]);
  });
  test('a weekly run opens on its next session and carries the calendar', () => {
    const when = threadWhen('en', LABELS)(KNITTING, TODAY);
    expect([when.line.iso, when.line.start, when.line.end, when.once, when.run?.line, when.calendar.length]).toEqual([
      '2026-11-19',
      '15:30',
      '18:00',
      undefined,
      'Every Thursday',
      3,
    ]);
  });
});

describe('priceLine', () => {
  test('free, from a price, or not listed', () => {
    expect(priceLine('en', LABELS)(KNITTING)).toEqual({ text: 'Free', free: true });
    expect(priceLine('en', LABELS)({ ...RECITAL, pr: 12 })).toEqual({ text: 'from €12', free: false });
    expect(priceLine('en', LABELS)(RECITAL)).toEqual({ text: 'Price not listed', free: false });
  });
});

describe('threadWhen for an event that owns a span of days', () => {
  test('it says the span, and today while it is on', () => {
    const show: CompactEvent = { ...RECITAL, s: '2026-11-01', e: '2026-12-03' };
    const when = threadWhen('en', LABELS)(show, TODAY);
    expect([when.line.iso, when.span, when.once, when.run]).toEqual([TODAY, '1 Nov – 3 Dec', undefined, undefined]);
  });
});

describe('placeLines', () => {
  test('the address loses the venue name the heading already says, and the town is added when it is missing', () => {
    expect(placeLines({ ...RECITAL, v: 'Teatro Sociale di Camogli', ct: 'genova' }, 'Teatro Sociale di Camogli, piazza Matteotti 5, Camogli (Genova)')).toEqual({
      street: 'piazza Matteotti 5, Camogli (Genova)',
      town: undefined,
    });
    expect(placeLines({ ...RECITAL, v: 'Biblioteca Podestà', ct: 'genova' }, 'Via Sacheri 9, 16143')).toEqual({ street: 'Via Sacheri 9, 16143', town: 'Genova' });
  });
  test('with no address there is still the town', () => {
    expect(placeLines({ ...RECITAL, ct: 'la-spezia' }, undefined)).toEqual({ street: undefined, town: 'La Spezia' });
  });
});

describe('listedLeaves', () => {
  const leaf = (iso: string, title: string | undefined) => ({ iso, weekday: 'Thu', day: iso.slice(8), month: 'Nov', times: [], title });
  test('under a calendar, sessions of one name are not listed again', () => {
    expect(listedLeaves([leaf('2026-11-19', 'Knitting'), leaf('2026-11-26', 'Knitting')], true)).toEqual([]);
  });
  test('sessions with names of their own are listed, eight at most', () => {
    const named = Array.from({ length: 10 }, (_, index) => leaf(`2026-11-${10 + index}`, `Night ${index}`));
    expect(listedLeaves(named, true).length).toBe(8);
  });
  test('with no calendar every session is listed', () => {
    expect(listedLeaves([leaf('2026-11-19', undefined)], false).length).toBe(1);
  });
});

describe('townOnward', () => {
  const ui = { headings: { allEvents: 'All events' }, eventPage: { allInCity: '{place}: all events' } };
  test('the town names the list and leads to its page', () => {
    expect(townOnward('en', { ...RECITAL, rg: 'liguria', ct: 'la-spezia' }, ui)).toEqual({
      place: 'La Spezia',
      onward: { href: '/en/liguria/la-spezia/', label: 'La Spezia: all events' },
    });
  });
  test('with no town, the region names it and nothing is offered', () => {
    expect(townOnward('en', { ...RECITAL, rg: 'liguria' }, ui)).toEqual({ place: 'liguria', onward: undefined });
  });
});
