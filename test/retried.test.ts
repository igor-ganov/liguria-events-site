// A weekly job that asks somebody else's server one question and gives up on
// the first bad answer loses a week to a hiccup. `retried` asks again, a
// little later each time, and only then lets the failure through.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { retried } from '../scripts/lib/retried.ts';

const sleeper = () => {
  const waits: number[] = [];
  return { waits, sleep: async (ms: number): Promise<void> => void waits.push(ms) };
};

const failing = (times: number) => {
  const state = { calls: 0 };
  return {
    state,
    ask: async (): Promise<string> => {
      state.calls += 1;
      return [state.calls].filter((call) => call > times).map(() => 'answer').at(0) ?? Promise.reject(new Error(`bad answer ${state.calls}`));
    },
  };
};

describe('retried', () => {
  test('returns the first good answer without waiting', async () => {
    const { waits, sleep } = sleeper();
    const { state, ask } = failing(0);
    assert.equal(await retried({ attempts: 4, waitMs: 1000, sleep })(ask), 'answer');
    assert.deepEqual([state.calls, waits], [1, []]);
  });
  test('asks again after a bad answer, waiting longer each time', async () => {
    const { waits, sleep } = sleeper();
    const { state, ask } = failing(2);
    assert.equal(await retried({ attempts: 4, waitMs: 1000, sleep })(ask), 'answer');
    assert.deepEqual([state.calls, waits], [3, [1000, 2000]]);
  });
  test('gives up after the last attempt with the last failure, and does not wait after it', async () => {
    const { waits, sleep } = sleeper();
    const { state, ask } = failing(9);
    await assert.rejects(retried({ attempts: 3, waitMs: 1000, sleep })(ask), /bad answer 3/);
    assert.deepEqual([state.calls, waits], [3, [1000, 2000]]);
  });
});
