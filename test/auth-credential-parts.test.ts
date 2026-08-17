// Pure helpers pulled out of src/lib/auth/credentials.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { fromB64Url } from '../src/lib/auth/from-b64-url.ts';
import { parseTransports } from '../src/lib/auth/parse-transports.ts';
import { toB64Url } from '../src/lib/auth/to-b64-url.ts';
import { toStoredCredential } from '../src/lib/auth/to-stored-credential.ts';
import type { CredentialRow } from '../src/lib/auth/credential-types.ts';

const row: CredentialRow = {
  credential_id: 'cred-1',
  user_id: 'u1',
  public_key: 'AQIDBP8',
  sign_count: 7,
  transports: '["internal","hybrid"]',
};

describe('toB64Url / fromB64Url', () => {
  test('base64url has no +, / or padding', () => {
    assert.equal(toB64Url(Uint8Array.from([251, 255, 254, 1])), '-__-AQ');
  });
  test('a key survives the round trip', () => {
    const bytes = Uint8Array.from([0, 1, 2, 3, 250, 251, 252, 253, 254, 255]);
    assert.deepEqual(fromB64Url(toB64Url(bytes)), bytes);
  });
});

describe('parseTransports', () => {
  test('a JSON array of strings reads back', () => {
    assert.deepEqual(parseTransports('["internal","usb"]'), ['internal', 'usb']);
  });
  test('a missing column is no transports at all', () => {
    assert.deepEqual(parseTransports(null), []);
  });
  test('broken JSON degrades to none instead of throwing', () => {
    assert.deepEqual(parseTransports('{oops'), []);
  });
  test('JSON that is not an array of strings degrades too', () => {
    assert.deepEqual(parseTransports('"usb"'), []);
    assert.deepEqual(parseTransports('{"a":1}'), []);
    assert.deepEqual(parseTransports('[1,"usb",null]'), ['usb']);
  });
});

describe('toStoredCredential', () => {
  const stored = toStoredCredential(row);
  test('keeps the id, owner and counter', () => {
    assert.equal(stored.credentialId, 'cred-1');
    assert.equal(stored.userId, 'u1');
    assert.equal(stored.counter, 7);
  });
  test('decodes the public key and the transports', () => {
    assert.deepEqual(stored.publicKey, Uint8Array.from([1, 2, 3, 4, 255]));
    assert.deepEqual(stored.transports, ['internal', 'hybrid']);
  });
});
