// The model screens an event after the response has gone, and may take its
// time. A member of staff can decide the same event in the meantime — and a
// verdict that lands afterwards used to write over what a person had decided.
// The model's verdict is for an event nobody has decided yet, and nothing else.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { verdictWrite } from '../src/lib/moderation/verdict-write.ts';

describe('what the model is allowed to write', () => {
  const write = verdictWrite('abc', { verdict: 'hold', reason: 'unclear', gem: true }, '2026-10-07T10:00:00.000Z');
  test('only onto an event that is still waiting', () => {
    assert.match(write.sql, /WHERE id = \? AND status = 'pending'$/);
  });
  test('the status its verdict stands for, the gem mark, and the time', () => {
    assert.deepEqual(write.values, ['held', 1, '2026-10-07T10:00:00.000Z', 'abc']);
  });
  test('published for an allow, rejected for a reject', () => {
    const statuses = (['allow', 'reject'] as const).map((verdict) => verdictWrite('abc', { verdict, reason: '', gem: false }, 'now').values.at(0));
    assert.deepEqual(statuses, ['published', 'rejected']);
  });
});
