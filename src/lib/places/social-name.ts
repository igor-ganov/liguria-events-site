// Which network a social URL belongs to, by host. First match wins; anything
// unrecognised is shown under the neutral label.
const NETWORKS: readonly (readonly [RegExp, string])[] = [
  [/instagram\.com/i, 'Instagram'],
  [/facebook\.com|fb\.com/i, 'Facebook'],
];

/** Display name for a place's social link. */
export const socialName = (url: string): string =>
  NETWORKS.find(([host]) => host.test(url))?.[1] ?? 'Social';
