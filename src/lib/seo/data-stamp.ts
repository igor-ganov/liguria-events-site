import { isDefined } from '../is-defined.ts';

/** The footer's "· data as of …Z" note. Only the pages that embed the event
 *  corpus know when it was collected; the rest say nothing. */
export const dataStamp = (generatedAt: string | undefined): string =>
  [generatedAt].filter(isDefined).map((at) => ` · data as of ${at.slice(0, 16)}Z`)[0] ?? '';
