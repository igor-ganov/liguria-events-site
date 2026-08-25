// A free, public, priority-placed create button with ads pointed at it is an
// invitation to spam. The cap is the number an automated account hits first.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { DAILY_CAP } from '../src/lib/events/daily-cap.ts';
import { createdToday } from '../src/lib/events/daily-quota.ts';

type Bound = { sql: string; args: readonly unknown[] };

const db = (n: number | undefined, seen: Bound[] = []) =>
  ({
    prepare: (sql: string) => ({
      bind: (...args: readonly unknown[]) => ({
        first: async () => {
          seen.push({ sql, args });
          return n === undefined ? undefined : { n };
        },
      }),
    }),
  }) as unknown as D1Database;

describe('createdToday', () => {
  test('counts what this account made since midnight', async () => {
    const seen: Bound[] = [];
    assert.equal(await createdToday(db(3, seen), 'u1', new Date('2026-09-01T14:22:00Z')), 3);
    assert.deepEqual(seen[0]?.args, ['u1', '2026-09-01T00:00:00']);
  });

  test('a day that has produced nothing counts as nothing, not as unknown', async () => {
    assert.equal(await createdToday(db(0), 'u1', new Date('2026-09-01T00:00:01Z')), 0);
  });

  test('an answer the driver cannot give reads as zero rather than blocking anyone', async () => {
    // Failing open on a count is right: the moderation gate is what protects
    // the public feed, and this only bounds volume.
    assert.equal(await createdToday(db(undefined), 'u1', new Date('2026-09-01T10:00:00Z')), 0);
  });

  test('the boundary is UTC midnight, not the viewer’s', async () => {
    // Otherwise the same account spends the same allowance twice by changing
    // its clock.
    const seen: Bound[] = [];
    await createdToday(db(1, seen), 'u1', new Date('2026-09-01T23:59:59Z'));
    assert.deepEqual(seen[0]?.args, ['u1', '2026-09-01T00:00:00']);
  });

  test('the cap is a real number, and a generous one', () => {
    assert.equal(DAILY_CAP, 20);
  });
});
