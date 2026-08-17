import { isDefined } from '../is-defined.ts';
import { jsonField } from '../json-field.ts';
import { jsonValue } from '../json-value.ts';

// The OpenAI-shaped path, walked one own-property at a time so a model that
// answers with a different shape reads as absent instead of throwing.
const choiceContent = (out: unknown): string | undefined =>
  [jsonValue(out, 'choices')]
    .filter((choices) => Array.isArray(choices))
    .map((choices) => choices.at(0))
    .map((choice) => jsonValue(choice, 'message'))
    .map((message) => jsonField(message, 'content'))
    .filter(isDefined)
    .at(0);

/** The model's text. Workers AI puts it under `.response` on some models and
 *  `.choices[0].message.content` (OpenAI-shaped) on others; anything else reads
 *  as no text at all. */
export const extractText = (out: unknown): string =>
  jsonField(out, 'response') ?? choiceContent(out) ?? '';
