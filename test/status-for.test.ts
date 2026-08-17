import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { statusFor } from '../src/lib/moderation/status-for.ts';

describe('statusFor', () => {
  test('an allow publishes, a reject rejects, a hold holds', () => {
    assert.equal(statusFor('allow'), 'published');
    assert.equal(statusFor('reject'), 'rejected');
    assert.equal(statusFor('hold'), 'held');
  });

  test('only an explicit allow ever publishes', () => {
    const published = (['allow', 'hold', 'reject'] as const).filter((v) => statusFor(v) === 'published');
    assert.deepEqual(published, ['allow']);
  });
});
