// Pure decisions behind the header's account slot and the sign-in dialog: who
// the viewer is, what their menu holds, what the URL asks for, and where a
// verified code lands them.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { accountMenuItems } from '../src/components/shell/account-menu-items.ts';
import { accountSlotMarkup } from '../src/components/shell/account-slot-markup.ts';
import { accountUserOf } from '../src/components/shell/account-user-of.ts';
import { authActions } from '../src/components/shell/auth-actions.ts';
import { signedOutMarkup } from '../src/components/shell/signed-out-markup.ts';
import { strippedAuthUrl } from '../src/components/shell/stripped-auth-url.ts';
import { verifyLanding } from '../src/components/shell/verify-landing.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import type { AccountUser } from '../src/components/shell/account-user.ts';

const auth = DEFAULT_PAGE_DATA.ui.auth;
const member: AccountUser = { handle: 'maria', role: 'user' };
const admin: AccountUser = { handle: 'root', role: 'admin' };

describe('accountUserOf', () => {
  test('reads the viewer out of the /api/auth/me body', () => {
    assert.deepEqual(accountUserOf({ user: { handle: 'maria', role: 'user' } }), member);
  });
  test('a stranger, an empty body and a malformed one all read as nobody', () => {
    assert.equal(accountUserOf({ user: undefined }), undefined);
    assert.equal(accountUserOf({}), undefined);
    assert.equal(accountUserOf(undefined), undefined);
    assert.equal(accountUserOf('nonsense'), undefined);
  });
  test('a user without a handle is nobody, not a blank profile', () => {
    assert.equal(accountUserOf({ user: { role: 'admin' } }), undefined);
  });
});

describe('accountMenuItems', () => {
  test('every viewer gets submit, settings and sign out', () => {
    const html = accountMenuItems(member, auth);
    assert.ok(html.includes(`href="/submit">+ ${auth.addEvent}`));
    assert.ok(html.includes(`href="/settings">${auth.settings}`));
    assert.ok(html.includes(`data-signout>${auth.signOut}`));
  });
  test('only an admin gets the moderation and users links', () => {
    assert.ok(!accountMenuItems(member, auth).includes('/admin/'));
    const html = accountMenuItems(admin, auth);
    assert.ok(html.includes(`href="/admin/">${auth.moderation}`));
    assert.ok(html.includes(`href="/admin/users/">${auth.users}`));
  });
  test('the admin links sit between submit and settings', () => {
    const html = accountMenuItems(admin, auth);
    assert.ok(html.indexOf('/submit') < html.indexOf('/admin/'));
    assert.ok(html.indexOf('/admin/users/') < html.indexOf('/settings'));
  });
});

describe('accountSlotMarkup', () => {
  test('the header gets one profile trigger with a dropdown', () => {
    const html = accountSlotMarkup(member, auth, false);
    assert.ok(html.startsWith('<div class="acct-menu" data-acct-menu>'));
    assert.ok(html.includes('data-acct-toggle'));
    assert.ok(html.includes('<span class="acct-avatar" aria-hidden="true">M</span>'));
    assert.ok(html.includes('<span class="acct-name">@maria</span>'));
    assert.ok(html.includes('data-acct-dropdown role="menu" hidden'));
  });
  test('the mobile FAB is already a popup, so it gets the flat list', () => {
    const html = accountSlotMarkup(member, auth, true);
    assert.equal(html, accountMenuItems(member, auth));
    assert.ok(!html.includes('acct-dropdown'));
  });
  test('the handle is escaped, so a name cannot inject markup', () => {
    const html = accountSlotMarkup({ handle: '<b>x', role: 'user' }, auth, false);
    assert.ok(html.includes('&lt;b&gt;x'));
    assert.ok(!html.includes('<b>x'));
  });
});

describe('signedOutMarkup', () => {
  test('offers exactly one sign-in button', () => {
    assert.equal(
      signedOutMarkup(auth),
      `<button type="button" class="account-signin" data-signin>${auth.signIn}</button>`,
    );
  });
});

describe('authActions', () => {
  test('a plain visit asks for nothing', () => {
    assert.deepEqual(authActions('', false, true), []);
    assert.deepEqual(authActions('?page=2', true, true), []);
  });
  test('?signin opens the dialog for a stranger', () => {
    assert.deepEqual(authActions('?signin=1', false, true), ['open']);
  });
  test('a stale ?setup link is only cleaned out when signed out', () => {
    assert.deepEqual(authActions('?setup=passkey', false, true), ['strip']);
    assert.deepEqual(authActions('?signin=1&setup=passkey', false, true), ['open', 'strip']);
  });
  test('a signed-in viewer never reaches the form — the params are stripped', () => {
    assert.deepEqual(authActions('?signin=1', true, true), ['strip']);
    assert.deepEqual(authActions('?next=/submit', true, true), ['strip']);
  });
  test('?setup enrols this device, but only where WebAuthn exists', () => {
    assert.deepEqual(authActions('?setup=passkey', true, true), ['strip', 'register']);
    assert.deepEqual(authActions('?setup=passkey', true, false), ['strip']);
  });
});

describe('strippedAuthUrl', () => {
  test('drops every sign-in param and keeps the rest of the address', () => {
    assert.equal(
      strippedAuthUrl('https://dovego.it/liguria/?signin=1&setup=passkey&next=/x&page=2#top'),
      '/liguria/?page=2#top',
    );
  });
  test('an address without them is unchanged', () => {
    assert.equal(strippedAuthUrl('https://dovego.it/liguria/map/'), '/liguria/map/');
  });
});

describe('verifyLanding', () => {
  test('a new account goes straight into passkey setup', () => {
    assert.deepEqual(verifyLanding(true, { ok: true, isNew: true }), ['/?setup=passkey']);
  });
  test('a returning one lands on the feed', () => {
    assert.deepEqual(verifyLanding(true, { ok: true }), ['/']);
    assert.deepEqual(verifyLanding(true, { ok: true, isNew: false }), ['/']);
  });
  test('a rejected code lands nowhere', () => {
    assert.deepEqual(verifyLanding(false, { ok: true, isNew: true }), []);
    assert.deepEqual(verifyLanding(true, { ok: false }), []);
    assert.deepEqual(verifyLanding(true, {}), []);
    assert.deepEqual(verifyLanding(true, undefined), []);
  });
});
