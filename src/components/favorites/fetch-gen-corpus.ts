import { fetchCorpus } from './route-payload.ts';
import { genState } from './gen-state.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** Shell: the events corpus, fetched once per page — a regenerate reuses it. */
export const fetchGenCorpus = async (): Promise<readonly CompactEvent[]> => {
  const corpus = genState.corpus ?? (await fetchCorpus());
  genState.corpus = corpus;
  return corpus;
};
