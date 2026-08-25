// Submitting needs an account and signing in navigates away. Without keeping
// the draft, showing the form before the sign-in wastes the author's afternoon
// — which would make the open form worse than the gate it replaced.
import { describe, test, beforeEach } from 'bun:test';
import assert from 'node:assert/strict';
import { stashDraft } from '../src/components/events/stash-draft.ts';
import { takeDraft } from '../src/components/events/take-draft.ts';
import { DRAFT_KEY } from '../src/components/events/draft-key.ts';

const store = new Map<string, string>();

// A minimal Storage stand-in: bun's test environment has no sessionStorage.
globalThis.sessionStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
  key: (index: number) => [...store.keys()][index] ?? null,
  get length() {
    return store.size;
  },
};

describe('the draft that survives a sign-in', () => {
  beforeEach(() => store.clear());

  test('comes back exactly as it went in', () => {
    stashDraft({ title: 'Concerto', categories: ['music'], free: true });
    assert.deepEqual(takeDraft(), { title: 'Concerto', categories: ['music'], free: true });
  });

  test('is forgotten once taken — restoring twice would overwrite new typing', () => {
    stashDraft({ title: 'Concerto' });
    takeDraft();
    assert.equal(takeDraft(), undefined);
    assert.equal(store.get(DRAFT_KEY), undefined);
  });

  test('nothing stashed is nothing restored', () => {
    assert.equal(takeDraft(), undefined);
  });

  test('a corrupted stash is discarded, not thrown', () => {
    store.set(DRAFT_KEY, '{not json');
    assert.equal(takeDraft(), undefined);
  });

  test('a stash that is not an object is refused', () => {
    store.set(DRAFT_KEY, '"just a string"');
    assert.equal(takeDraft(), undefined);
    store.set(DRAFT_KEY, '[1,2,3]');
    assert.equal(takeDraft(), undefined);
  });
});
