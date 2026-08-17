// Pure helpers pulled out of src/lib/auth/magic.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isMagicToken } from '../src/lib/auth/is-magic-token.ts';
import { MAGIC } from '../src/lib/auth/magic-config.ts';
import { magicAttemptsExhausted } from '../src/lib/auth/magic-attempts-exhausted.ts';
import { randomCode } from '../src/lib/auth/random-code.ts';
import { randomToken } from '../src/lib/auth/random-token.ts';

describe('MAGIC config', () => {
  test('the lifetimes and the ceiling are the ones the login was built with', () => {
    assert.deepEqual(MAGIC, {
      tokenPrefix: 'magic:',
      codePrefix: 'code:',
      ratePrefix: 'magic-rate:',
      ttlS: 300,
      rateTtlS: 60,
      maxAttempts: 5,
    });
  });
});

describe('isMagicToken', () => {
  test('accepts exactly 32 lowercase hex characters', () => {
    assert.equal(isMagicToken(randomToken()), true);
    assert.equal(isMagicToken('0123456789abcdef0123456789abcdef'), true);
  });
  test('refuses anything else — the shape guard before KV is asked', () => {
    assert.equal(isMagicToken(''), false);
    assert.equal(isMagicToken('0123456789ABCDEF0123456789ABCDEF'), false);
    assert.equal(isMagicToken('0123456789abcdef0123456789abcde'), false);
    assert.equal(isMagicToken('0123456789abcdef0123456789abcdef0'), false);
    assert.equal(isMagicToken('../../etc/passwd'), false);
  });
});

describe('magicAttemptsExhausted', () => {
  test('the fifth wrong code burns the record', () => {
    assert.equal(magicAttemptsExhausted(4), false);
    assert.equal(magicAttemptsExhausted(5), true);
    assert.equal(magicAttemptsExhausted(6), true);
  });
});

describe('randomToken / randomCode', () => {
  test('a token is 32 hex characters and does not repeat', () => {
    assert.match(randomToken(), /^[0-9a-f]{32}$/);
    assert.notEqual(randomToken(), randomToken());
  });
  test('a code is always six digits', () => {
    const codes = Array.from({ length: 50 }, randomCode);
    assert.equal(codes.every((code) => /^\d{6}$/.test(code)), true);
  });
});
