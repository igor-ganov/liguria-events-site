import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { passkeyAttachment } from '../src/lib/auth/passkey-attachment.ts';

describe('passkeyAttachment', () => {
  test('keeps the two values the ceremony understands', () => {
    assert.equal(passkeyAttachment('platform'), 'platform');
    assert.equal(passkeyAttachment('cross-platform'), 'cross-platform');
  });

  test('any other name steers nowhere', () => {
    assert.equal(passkeyAttachment('usb'), undefined);
    assert.equal(passkeyAttachment(''), undefined);
    assert.equal(passkeyAttachment(undefined), undefined);
  });

  test('a non-string field steers nowhere', () => {
    assert.equal(passkeyAttachment(1), undefined);
    assert.equal(passkeyAttachment({ platform: true }), undefined);
    assert.equal(passkeyAttachment(['platform']), undefined);
  });
});
