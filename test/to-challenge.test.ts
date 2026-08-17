import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { toChallenge } from '../src/lib/auth/to-challenge.ts';

const row = (over: Partial<Parameters<typeof toChallenge>[0]>) => ({
  purpose: 'auth',
  user_id: null,
  challenge: 'chal',
  expires_at: 0,
  ...over,
});

describe('toChallenge', () => {
  test("'register' survives as the registration purpose", () => {
    assert.equal(toChallenge(row({ purpose: 'register' })).purpose, 'register');
  });

  test('anything else collapses to the authentication purpose', () => {
    assert.equal(toChallenge(row({ purpose: 'auth' })).purpose, 'auth');
    assert.equal(toChallenge(row({ purpose: 'nonsense' })).purpose, 'auth');
    assert.equal(toChallenge(row({ purpose: '' })).purpose, 'auth');
  });

  test('a stored user id comes through', () => {
    assert.equal(toChallenge(row({ user_id: 'u1' })).userId, 'u1');
  });

  test('an absent user id leaves the key off entirely', () => {
    const challenge = toChallenge(row({}));
    assert.equal(Object.hasOwn(challenge, 'userId'), false);
  });

  test('an empty stored user id is treated as absent, not as an empty id', () => {
    assert.equal(Object.hasOwn(toChallenge(row({ user_id: '' })), 'userId'), false);
  });

  test('the challenge value is passed through verbatim', () => {
    assert.equal(toChallenge(row({ challenge: 'AAbb--__' })).challenge, 'AAbb--__');
  });
});
