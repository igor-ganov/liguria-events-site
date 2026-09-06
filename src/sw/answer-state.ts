import { isDefined } from '../lib/is-defined.ts';
import { outcomeFor } from './outcome-for.ts';
import type { SwClient } from './sw-scope.ts';

/** Answer the page that asked what became of the copy it is showing. */
export const answerState = async (url: string | undefined, source: SwClient | undefined): Promise<void> => {
  await Promise.all(
    [url]
      .filter(isDefined)
      .flatMap((asked) =>
        [source].filter(isDefined).map(async (client) => client.postMessage(await outcomeFor(asked))),
      ),
  );
};
