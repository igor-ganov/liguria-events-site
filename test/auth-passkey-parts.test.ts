// Pure helpers pulled out of src/lib/auth/passkey.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { authenticatorSelection } from '../src/lib/auth/authenticator-selection.ts';
import { registrationOptions } from '../src/lib/auth/registration-options.ts';
import { toDescriptors } from '../src/lib/auth/to-descriptors.ts';

describe('toDescriptors', () => {
  test('an id keeps its transports', () => {
    assert.deepEqual(toDescriptors([{ id: 'cred-1', transports: ['internal', 'hybrid'] }]), [
      { id: 'cred-1', transports: ['internal', 'hybrid'] },
    ]);
  });
  test('no credentials is an empty list, not a missing one', () => {
    assert.deepEqual(toDescriptors([]), []);
  });
});

describe('authenticatorSelection', () => {
  test('every passkey stays discoverable', () => {
    assert.deepEqual(authenticatorSelection(), {
      residentKey: 'required',
      userVerification: 'preferred',
    });
  });
  test('a named attachment steers the ceremony', () => {
    assert.deepEqual(authenticatorSelection('platform'), {
      residentKey: 'required',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    });
    assert.equal(authenticatorSelection('cross-platform').authenticatorAttachment, 'cross-platform');
  });
  test('without one the key is absent, not undefined', () => {
    assert.equal(Object.hasOwn(authenticatorSelection(), 'authenticatorAttachment'), false);
  });
});

describe('registrationOptions', () => {
  test('carries the selection and the exclude list into the ceremony', async () => {
    const options = await registrationOptions('dovego.it', 'u1', 'a@example.test', [
      { id: 'cred-1', transports: ['internal'] },
    ]);
    assert.equal(options.rp.id, 'dovego.it');
    assert.equal(options.authenticatorSelection?.residentKey, 'required');
    assert.equal(Object.hasOwn(options.authenticatorSelection ?? {}, 'authenticatorAttachment'), false);
    assert.deepEqual(options.excludeCredentials, [
      { id: 'cred-1', transports: ['internal'], type: 'public-key' },
    ]);
  });
  test('an attachment reaches the options', async () => {
    const options = await registrationOptions('dovego.it', 'u1', 'a@example.test', [], 'platform');
    assert.equal(options.authenticatorSelection?.authenticatorAttachment, 'platform');
  });
});
