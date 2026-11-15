/** What a tip is about: a place, an event or tradition, or the site itself. */
export type TipKind = 'place' | 'event' | 'site';

/** One line shown while a page loads. */
export type Tip = Readonly<{ kind: TipKind; text: string }>;
