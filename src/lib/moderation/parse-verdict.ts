import { jsonField } from '../json-field.ts';
import { jsonValue } from '../json-value.ts';
import type { Verdict } from './verdict-types.ts';

// Fails safe: unparsable output holds the event rather than publishing it.
const UNCLASSIFIED: Verdict = { verdict: 'hold', reason: 'could not classify', gem: false };

// Only these two are taken at face value; every other answer holds.
const VERDICTS = new Map<unknown, Verdict['verdict']>([
  ['allow', 'allow'],
  ['reject', 'reject'],
]);

const shaped = (parsed: unknown): Verdict => ({
  verdict: VERDICTS.get(jsonValue(parsed, 'verdict')) ?? 'hold',
  reason: jsonField(parsed, 'reason')?.slice(0, 300) ?? '',
  gem: jsonValue(parsed, 'gem') === true,
});

const fromJson = (json: string): Verdict => {
  try {
    return shaped(JSON.parse(json));
  } catch {
    return UNCLASSIFIED;
  }
};

/** Read the verdict out of the model's reply: the first {…} block in the text,
 *  parsed and shaped. Text with no JSON object in it holds the event. */
export const parseVerdict = (text: string): Verdict =>
  (text.match(/\{[\s\S]*\}/) ?? [])
    .slice(0, 1)
    .map(fromJson)
    .at(0) ?? UNCLASSIFIED;
