import { markShut } from './mark-shut.ts';
import { readStored } from './read-stored.ts';
import { setDayShut } from './set-day-shut.ts';
import { SHUT_KEY } from './shut-key.ts';
import { shutDaysOf } from './shut-days-of.ts';
import { shutWhileParsing } from './shut-while-parsing.ts';

/**
 * The inline script that folds the days a reader folded before the feed is
 * painted. It is printed from the very functions the page's module uses, so the
 * two cannot disagree — each of them is self-contained for that reason. A
 * reader who folded nothing pays for one storage read.
 */
export const feedDaysBoot = (): string =>
  `((days) => days.length > 0 && (${shutWhileParsing.toString()})(() => (${markShut.toString()})(days, document, ${setDayShut.toString()})))` +
  `((${shutDaysOf.toString()})((${readStored.toString()})(${JSON.stringify(SHUT_KEY)}), ''));`;
