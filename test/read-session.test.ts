import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { readSession } from '../src/lib/auth/read-session.ts';
import { sessionHmac } from '../src/lib/auth/session-hmac.ts';
import { signSession } from '../src/lib/auth/sign-session.ts';

const SECRET = 'test-secret';
const NOW = 1_700_000_000_000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// This is the whole authentication check for every request the middleware sees:
// a token that should be rejected but is not signs an attacker in as anyone.
describe('readSession', () => {
  test('accepts a token it just signed', async () => {
    const token = await signSession(SECRET, 'user-1', NOW);
    assert.equal(await readSession(token, SECRET, NOW), 'user-1');
  });

  test('the token carries a seven-day expiry', async () => {
    const token = await signSession(SECRET, 'user-1', NOW);
    assert.equal(token.split('.')[1], String(NOW + WEEK_MS));
  });

  test('rejects a token signed with another secret', async () => {
    const token = await signSession('other-secret', 'user-1', NOW);
    assert.equal(await readSession(token, SECRET, NOW), null);
  });

  test('rejects a tampered subject', async () => {
    const [, expiry, sig] = (await signSession(SECRET, 'user-1', NOW)).split('.');
    assert.equal(await readSession(`admin.${expiry}.${sig}`, SECRET, NOW), null);
  });

  test('rejects a tampered expiry', async () => {
    const [subject, , sig] = (await signSession(SECRET, 'user-1', NOW)).split('.');
    assert.equal(await readSession(`${subject}.${NOW + WEEK_MS * 52}.${sig}`, SECRET, NOW), null);
  });

  test('rejects an expired token', async () => {
    const token = await signSession(SECRET, 'user-1', NOW);
    assert.equal(await readSession(token, SECRET, NOW + WEEK_MS + 1), null);
  });

  test('accepts a token in its last millisecond', async () => {
    const token = await signSession(SECRET, 'user-1', NOW);
    assert.equal(await readSession(token, SECRET, NOW + WEEK_MS), 'user-1');
  });

  test('rejects a signature of the wrong length', async () => {
    const [subject, expiry, sig] = (await signSession(SECRET, 'user-1', NOW)).split('.');
    assert.equal(await readSession(`${subject}.${expiry}.${sig?.slice(0, -1)}`, SECRET, NOW), null);
  });

  test('rejects a token with too few segments', async () => {
    assert.equal(await readSession('user-1', SECRET, NOW), null);
    assert.equal(await readSession(`user-1.${NOW + WEEK_MS}`, SECRET, NOW), null);
  });

  test('rejects an empty token', async () => {
    assert.equal(await readSession('', SECRET, NOW), null);
  });

  test('rejects an unsigned token whose signature slot is empty', async () => {
    assert.equal(await readSession(`user-1.${NOW + WEEK_MS}.`, SECRET, NOW), null);
  });

  test('a subject containing a dot cannot be spliced into another identity', async () => {
    const token = await signSession(SECRET, 'user.1', NOW);
    assert.equal(await readSession(token, SECRET, NOW), null);
  });

  test('a validly signed non-numeric expiry stays accepted, as before', async () => {
    const payload = 'user-1.never';
    const token = `${payload}.${await sessionHmac(SECRET, payload)}`;
    assert.equal(await readSession(token, SECRET, NOW), 'user-1');
  });
});
