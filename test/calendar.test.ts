// Calendar lib (AC-2.x).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { addMonths } from '../src/lib/calendar/add-months.ts';
import { dayHeading } from '../src/lib/calendar/day-heading.ts';
import { dayKindOf } from '../src/lib/calendar/day-kind.ts';
import { monthGrid } from '../src/lib/calendar/month-grid.ts';
import { monthKeyOf } from '../src/lib/calendar/month-key-of.ts';
import { monthTitle } from '../src/lib/calendar/month-title.ts';

describe('month key math', () => {
  test('monthKeyOf strips the day', () => {
    assert.equal(monthKeyOf('2026-07-04'), '2026-07');
  });
  test('addMonths crosses year bounds both ways', () => {
    assert.equal(addMonths('2026-12', 1), '2027-01');
    assert.equal(addMonths('2026-01', -1), '2025-12');
    assert.equal(addMonths('2026-07', 0), '2026-07');
  });
  test('monthTitle renders English month + year', () => {
    assert.equal(monthTitle('2026-07'), 'July 2026');
  });
});

describe('monthGrid (AC-2.1)', () => {
  test('July 2026: Mon-first, starts 29 June, ends 2 August', () => {
    const grid = monthGrid('2026-07');
    assert.equal(grid[0]?.[0], '2026-06-29'); // Monday before the 1st (Wed)
    assert.equal(grid.at(-1)?.at(-1), '2026-08-02'); // Sunday after the 31st
    for (const week of grid) {
      assert.equal(week.length, 7);
    }
  });
  test('February 2027 (starts on Monday, 28 days) is exactly 4 rows', () => {
    const grid = monthGrid('2027-02');
    assert.equal(grid.length, 4);
    assert.equal(grid[0]?.[0], '2027-02-01');
    assert.equal(grid.at(-1)?.at(-1), '2027-02-28');
  });
});

describe('dayKindOf (AC-2.4)', () => {
  const kind = dayKindOf('2026-07', '2026-07-04');
  test('exhaustive over in/out/today', () => {
    assert.equal(kind('2026-07-04'), 'today');
    assert.equal(kind('2026-07-05'), 'in');
    assert.equal(kind('2026-06-30'), 'out');
  });
});

describe('dayHeading', () => {
  test('formats the feed group heading', () => {
    assert.equal(dayHeading('2026-07-04'), 'Sat, 4 July');
  });
});
