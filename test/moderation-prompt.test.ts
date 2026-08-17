import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { moderationPrompt } from '../src/lib/moderation/moderation-prompt.ts';
import { PROHIBITED } from '../src/lib/moderation/policy.ts';

describe('moderationPrompt', () => {
  test('carries every prohibited rule into the prompt', () => {
    const prompt = moderationPrompt('Festa', 'A party');
    assert.ok(PROHIBITED.every((rule) => prompt.includes(rule)));
  });

  test('states the JSON-only output contract', () => {
    const prompt = moderationPrompt('Festa', 'A party');
    assert.ok(prompt.includes('ONLY JSON'));
    assert.ok(prompt.includes('"verdict"'));
  });

  test('includes the event under review', () => {
    const prompt = moderationPrompt('Festa della Musica', 'Free concert in Sestri');
    assert.ok(prompt.includes('Title: Festa della Musica'));
    assert.ok(prompt.includes('Description: Free concert in Sestri'));
  });
});
