import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { POLICY_VERSION, PROHIBITED, policyRubric } from '../src/lib/moderation/policy.ts';

// The rubric is the prompt the AI moderator judges by — every rule must reach it,
// numbered, or a whole class of content stops being screened.
describe('policyRubric', () => {
  test('numbers every prohibited rule', () => {
    const rubric = policyRubric();
    assert.ok(PROHIBITED.every((rule, i) => rubric.includes(`${i + 1}. ${rule}`)));
  });

  test('has one line per rule plus the heading', () => {
    assert.equal(policyRubric().split('\n').length, PROHIBITED.length + 1);
  });

  test('names the platform it is scoped to', () => {
    assert.match(policyRubric(), /^Prohibited on this events platform:/);
  });
});

describe('POLICY_VERSION', () => {
  test('is a datestamp a stored verdict can be compared against', () => {
    assert.match(POLICY_VERSION, /^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('PROHIBITED', () => {
  test('every rule is a non-empty sentence', () => {
    assert.ok(PROHIBITED.every((rule) => rule.length > 20 && rule.endsWith('.')));
  });
});
