import type { SemanticIds } from './suggest-doc.ts';

const isIdList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** The endpoint's answer, checked once at the edge of the page. Anything not
 *  shaped like it is no answer at all, and the letters alone decide. No Effect
 *  Schema here: the feed page ships without that runtime on purpose. Object()
 *  boxes a primitive or gives {} for nothing, so the reads below never throw. */
export const parseSemantic = (value: unknown): SemanticIds | undefined => {
  const events: unknown = Reflect.get(Object(value), 'events');
  const venues: unknown = Reflect.get(Object(value), 'venues');
  return [{ events, venues }]
    .filter((found): found is SemanticIds => isIdList(found.events) && isIdList(found.venues))
    .at(0);
};
