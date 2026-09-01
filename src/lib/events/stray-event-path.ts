import { branch } from '../branch.ts';
import { eventIdOfPath } from './event-id-of-path.ts';
import { LOCALES } from '../i18n/locales.ts';
import { REGION_NAMES } from '../region/regions.ts';

/**
 * Where a stray event address should have pointed.
 *
 * Third-party crawlers assemble `/{lang}/{region}/{event id}/` — an event id in
 * the slot a city slug belongs in — and ask for it tens of thousands of times a
 * day. The site has never linked to that shape, but the ids are ours and the
 * events are alive, so the right answer is a redirect rather than a 404.
 *
 * Deliberately narrow: a known locale, a known region, and a well-formed id.
 * Anything looser turns this into a catch-all that rescues genuine nonsense.
 */
export const strayEventPath = (pathname: string): string | undefined => {
  const parts = pathname.split('/').filter((part) => part !== '');
  const lang = LOCALES.filter((locale) => locale !== 'en').find((locale) => locale === parts[0]);
  const rest = parts.slice(...[lang].filter((found) => found !== undefined).map(() => 1));
  const region = Object.keys(REGION_NAMES).find((slug) => slug === rest[0]);
  const id = eventIdOfPath(rest[1] ?? '');
  const prefix = [lang].filter((found) => found !== undefined).map((found) => `/${found}`).at(0) ?? '';
  return branch(rest.length === 2 && region !== undefined && id !== '')(
    () => `${prefix}/event/${id}/`,
    () => undefined,
  );
};
