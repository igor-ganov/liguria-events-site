import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { needsAuth } from '../src/lib/auth/needs-auth.ts';
import { authGate } from '../src/lib/auth/auth-gate.ts';

describe('needsAuth', () => {
  test('gates the protected sections and anything under them', () => {
    for (const path of ['/submit', '/admin', '/settings', '/submit/', '/admin/users', '/settings/passkeys']) {
      assert.equal(needsAuth(path), true, path);
    }
  });
  test('leaves public paths alone', () => {
    for (const path of ['/', '/liguria/', '/event/abc', '/submitted', '/administrator', '/settingsx']) {
      assert.equal(needsAuth(path), false, path);
    }
  });
});

describe('authGate', () => {
  const member = { banned: false };
  const banned = { banned: true };

  test('lets any visitor through on a public path', () => {
    assert.equal(authGate('/liguria/', undefined), undefined);
    assert.equal(authGate('/liguria/', member), undefined);
    assert.equal(authGate('/liguria/', banned), undefined);
  });

  test('lets a signed-in member into a protected path', () => {
    assert.equal(authGate('/submit', member), undefined);
  });

  test('sends an anonymous visitor home with sign-in armed, carrying the path', () => {
    assert.equal(authGate('/submit', undefined), '/?signin=1&next=%2Fsubmit');
    assert.equal(authGate('/admin/users', undefined), '/?signin=1&next=%2Fadmin%2Fusers');
  });

  test('a banned account is bounced to the notice, and that wins over sign-in', () => {
    assert.equal(authGate('/settings', banned), '/?banned=1');
    assert.equal(authGate('/admin', banned), '/?banned=1');
  });

  test('a user object with no banned flag counts as not banned', () => {
    assert.equal(authGate('/submit', {}), undefined);
  });
});
