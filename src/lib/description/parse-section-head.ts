import { SECTION_ICON } from './section-icon.ts';

/** A heading split into the stable type that drives its icon and the label the
 *  reader sees. */
export type SectionHead = { readonly type: string; readonly label: string };

// An optional leading type tag the enrichment emits, e.g. "[tickets] Biglietti".
const TYPE_TAG = /^\s*\[([a-z-]+)\]\s*/;

const isKnownType = (tag: string | undefined): tag is string =>
  tag !== undefined && SECTION_ICON.has(tag);

/** Read a heading's type tag. The tag is stripped from the visible label even
 *  when it names a type we do not know, so a stray marker never leaks. */
export const parseSectionHead = (rawLabel: string): SectionHead => ({
  type: [TYPE_TAG.exec(rawLabel)?.[1]].filter(isKnownType)[0] ?? 'info',
  label: rawLabel.replace(TYPE_TAG, ''),
});
