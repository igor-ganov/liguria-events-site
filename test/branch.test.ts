// branch() HOF + feed toggle (AC-3.2, AC-5.1).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { branch } from '../src/lib/branch.ts';
import { toggleCategory } from '../src/components/events-feed/toggle-category.ts';

describe('branch', () => {
  test('routes to the matching arm lazily', () => {
    const calls: string[] = [];
    const result = branch(true)(
      () => {
        calls.push('t');
        return 'yes';
      },
      () => {
        calls.push('f');
        return 'no';
      },
    );
    assert.equal(result, 'yes');
    assert.deepEqual(calls, ['t']);
    assert.equal(branch(false)(() => 'yes', () => 'no'), 'no');
  });
});

describe('toggleCategory', () => {
  test('adds when absent, removes when present, immutably', () => {
    const on = toggleCategory([], 'music');
    assert.deepEqual(on, ['music']);
    assert.deepEqual(toggleCategory(on, 'music'), []);
    assert.deepEqual(toggleCategory(on, 'art'), ['music', 'art']);
  });
});
