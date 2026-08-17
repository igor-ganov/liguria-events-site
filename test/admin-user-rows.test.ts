// Pure helpers pulled out of pages/admin/users.astro.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { userRows } from '../src/lib/admin/user-rows.ts';
import { dateRange } from '../src/lib/events/date-range.ts';

const user = (over: Readonly<{ id?: string; email?: string }> = {}) => ({
  id: 'u1',
  email: 'someone@example.test',
  ...over,
});
const submitted = { id: 'e1', status: 'pending' };

describe('userRows', () => {
  const rows = userRows(
    [user(), user({ id: 'u2', email: 'Root@Example.test' })],
    new Map([['u1', [submitted]]]),
    ['root@example.test'],
    'u1',
  );
  test('pairs each account with its own submissions', () => {
    assert.deepEqual(rows[0]?.events, [submitted]);
    assert.deepEqual(rows[1]?.events, []);
  });
  test('flags your own account and the untouchable root admin', () => {
    assert.equal(rows[0]?.mine, true);
    assert.equal(rows[0]?.root, false);
    assert.equal(rows[1]?.mine, false);
    assert.equal(rows[1]?.root, true);
  });
});

describe('dateRange', () => {
  test('shows one date for a one-day event and both for a run', () => {
    assert.equal(dateRange('2026-07-04'), '2026-07-04');
    assert.equal(dateRange('2026-07-04', ''), '2026-07-04');
    assert.equal(dateRange('2026-07-04', '2026-07-06'), '2026-07-04–2026-07-06');
  });
});
