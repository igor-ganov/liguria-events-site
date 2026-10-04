type Rule = Readonly<{ host: string; from: RegExp; to: string }>;

// Sources list a thumbnail and serve the photograph next to it. Each rule names
// one host and the one rewrite that reaches the larger file there; a sampled
// check of the live corpus found every rewritten address answering with an
// image. A host without a rule is left alone rather than guessed at.
const RULES: readonly Rule[] = [
  { host: 'www.mentelocale.it', from: /\/(\d+)_half\.(jpe?g|png|webp)/, to: '/$1.$2' },
  { host: 'www.genovateatro.it', from: /\/(\d+)_half\.(jpe?g|png|webp)/, to: '/$1.$2' },
  { host: 'www.eventiesagre.it', from: /\/thumb\//, to: '/img/' },
];

const hostOf = (url: string): string => /^https?:\/\/([^/]+)/.exec(url)?.[1] ?? '';

/** The largest cover a source is known to serve for the address it listed. A
 *  card that fills the width of the screen shows a 326-pixel thumbnail as a
 *  smear; the same source serves twice that under a neighbouring name. */
export const largeCover = (url: string): string =>
  RULES.filter((rule) => rule.host === hostOf(url))
    .map((rule) => url.replace(rule.from, rule.to))
    .at(0) ?? url;
