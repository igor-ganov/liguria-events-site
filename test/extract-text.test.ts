import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { extractText } from '../src/lib/moderation/extract-text.ts';

describe('extractText', () => {
  test('reads the plain `.response` shape', () => {
    assert.equal(extractText({ response: 'hello' }), 'hello');
  });

  test('reads the OpenAI-shaped choices path', () => {
    assert.equal(extractText({ choices: [{ message: { content: 'hi' } }] }), 'hi');
  });

  test('prefers `.response` when a model answers with both', () => {
    assert.equal(extractText({ response: 'first', choices: [{ message: { content: 'second' } }] }), 'first');
  });

  test('a non-string response falls through to the choices path', () => {
    assert.equal(extractText({ response: 42, choices: [{ message: { content: 'hi' } }] }), 'hi');
  });

  test('an unknown shape reads as no text', () => {
    assert.equal(extractText({ nope: true }), '');
    assert.equal(extractText(undefined), '');
    assert.equal(extractText('a bare string'), '');
    assert.equal(extractText({ choices: [] }), '');
    assert.equal(extractText({ choices: [{}] }), '');
  });
});
