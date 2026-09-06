/**
 * What the worker tells a page about the copy that page is showing.
 *
 * `fresh` — something newer has been stored behind it, and the reader is
 * offered it rather than having the page swapped underneath them.
 * `same` — the site was reached and holds what is already on screen.
 * `offline` — the site could not be reached at all.
 *
 * All three are measured rather than guessed: `navigator.onLine` keeps
 * reporting true with the network cut, so a request that was actually tried is
 * the only source for "there is no connection".
 */
export type PageMessage = Readonly<{ kind: 'fresh' | 'same' | 'offline'; url: string }>;
