import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { uploadExt } from '../src/lib/img/upload-ext.ts';

describe('uploadExt', () => {
  test('names the extension for every accepted type', () => {
    assert.equal(uploadExt('image/jpeg'), 'jpg');
    assert.equal(uploadExt('image/png'), 'png');
    assert.equal(uploadExt('image/webp'), 'webp');
    assert.equal(uploadExt('image/avif'), 'avif');
    assert.equal(uploadExt('image/gif'), 'gif');
  });

  test('an unaccepted type has no extension', () => {
    assert.equal(uploadExt('image/tiff'), undefined);
    assert.equal(uploadExt('application/pdf'), undefined);
    assert.equal(uploadExt(''), undefined);
  });

  // The MIME type comes from the browser's multipart body, so the lookup must
  // not answer for an inherited object member.
  test('an inherited member is not a type', () => {
    assert.equal(uploadExt('constructor'), undefined);
    assert.equal(uploadExt('toString'), undefined);
  });
});
