import { branch } from '../../lib/branch.ts';
import { mergeSuggestions } from '../../lib/suggest/merge-suggestions.ts';
import { semanticIds } from './semantic-ids.ts';
import { showGroups } from './show-groups.ts';
import { suggestSource } from './suggest-source.ts';
import type { SemanticIds } from '../../lib/suggest/suggest-doc.ts';
import type { SuggestHost } from './suggest-host.ts';

/** Where the box is: which region's file, and the day the page was built for. */
export type SuggestPlace = Readonly<{ region: string; today: string }>;

// The letters answer on every keystroke, from the device. The meaning is
// asked once typing pauses, from three letters on: each request spends from
// the daily Workers AI allowance, and a word half typed means little.
const PAUSE_MS = 150;
const MIN_LETTERS = 2;
const MIN_MEANING = 3;

/** Answer what is typed: letters at once, then letters and meaning merged.
 *  An answer for a query no longer in the box is dropped. */
export const suggestController = (host: SuggestHost, input: HTMLInputElement, place: SuggestPlace) => {
  const typed = (): string => input.value.trim();
  const source = () => suggestSource(place.region, host.locale, place.today);
  let pause: ReturnType<typeof setTimeout> | undefined;
  let asking = new AbortController();
  const answer = async (query: string, meaning: SemanticIds | undefined): Promise<void> => {
    const found = await source();
    const lexical = branch(query.length >= MIN_LETTERS)(() => found.lexical(query), () => []);
    [query].filter((still) => still === typed()).forEach(() => showGroups(host, mergeSuggestions(found.docs, lexical, meaning)));
  };
  const ask = (query: string): void => {
    asking = new AbortController();
    void semanticIds(place.region, query, asking.signal).then((meaning) => answer(query, meaning));
  };
  return {
    typed: (): void => {
      clearTimeout(pause);
      asking.abort();
      void answer(typed(), undefined);
      pause = [typed()].filter((query) => query.length >= MIN_MEANING).map((query) => setTimeout(() => ask(query), PAUSE_MS)).at(0);
    },
    warm: (): void => void source(),
  };
};
