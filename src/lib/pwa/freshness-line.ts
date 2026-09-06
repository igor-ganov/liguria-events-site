/** The three things a reader may need to be told about the page they are on. */
export type FreshnessWords = Readonly<{ offline: string; saved: string; updated: string }>;

/** Where the page came from, how old it is, and whether something newer has
 *  since arrived behind it. */
export type Freshness = Readonly<{
  from: 'network' | 'store';
  age: string;
  updated: boolean;
  offline?: boolean | undefined;
}>;

/**
 * What the bar says, or nothing.
 *
 * A page that came from the network is current and says nothing. A page that
 * came from the device ALWAYS says how old it is — being online does not make
 * a stored copy current, and an events site showing yesterday without saying
 * so is worse than showing nothing. Once something newer has arrived behind
 * it, that is the only thing worth saying.
 */
export const freshnessLine = (words: FreshnessWords, state: Freshness): string =>
  [
    ...[state].filter(({ from }) => from === 'network').map(() => ''),
    ...[state].filter(({ updated }) => updated).map(() => words.updated),
    ...[state].filter(({ offline }) => offline === true).map(() => words.offline.replace('{when}', state.age)),
    ...[state].map(() => words.saved.replace('{when}', state.age)),
  ].at(0) ?? '';
