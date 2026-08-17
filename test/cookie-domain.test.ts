import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { cookieDomain } from '../src/lib/auth/cookie-domain.ts';
import { sessionCookie } from '../src/lib/auth/session-cookie.ts';

// The session is shared with admin.dovego.it, and a delete whose domain does not
// match the set leaves the cookie alive — so this fragment is security-relevant.
describe('cookieDomain', () => {
  test('production widens the cookie to the apex domain', () => {
    assert.deepEqual(cookieDomain(true), { domain: '.dovego.it' });
  });

  test('dev keeps a host-only cookie: no domain key at all', () => {
    assert.deepEqual(cookieDomain(false), {});
    assert.equal(Object.hasOwn(cookieDomain(false), 'domain'), false);
  });
});

describe('sessionCookie', () => {
  test('production carries every hardening flag plus the shared domain', () => {
    assert.deepEqual(sessionCookie(true), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: '.dovego.it',
    });
  });

  test('dev carries the same flags without a domain', () => {
    assert.deepEqual(sessionCookie(false), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });
});
