const NOTE = 'src/data/releases.json';

/** A commit may decline in its own words, but it has to give the reason: a
 *  bare "none" is what gets typed to make a guard go away. */
const OPT_OUT = /^Release-Note:\s*none\s*\(.+\)\s*$/m;

/** What a reader can notice: the site's own code and its database. Data files
 *  under src/data are content, not behaviour. */
const isVisible = (file: string): boolean =>
  (file.startsWith('src/') && !file.startsWith('src/data/')) || file.startsWith('migrations/');

/** Whether a push changes the site without saying so in the release notes. */
export const needsReleaseNote = (files: readonly string[], messages: readonly string[]): boolean =>
  files.some(isVisible) && !files.includes(NOTE) && !messages.some((message) => OPT_OUT.test(message));
