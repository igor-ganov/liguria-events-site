import { navigate } from 'astro:transitions/client';
import { isLocale } from '../../lib/i18n/is-locale.ts';
import { langSwapUrl } from '../../lib/i18n/lang-swap-url.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

// A click meant for this tab. One with a modifier asks for another tab or a
// download, and keeps the browser's own handling.
const plain = (event: MouseEvent): boolean =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

// The page again, in the other language, standing where this one stood: the
// same step of the history and the same scroll. The router replaces the step
// but opens the new page at its top, so the scroll is put back once it has.
const swapTo = (lang: Locale): void =>
  [langSwapUrl(new URL(location.href), lang)]
    .filter((to): to is URL => to !== undefined)
    .forEach((to) => {
      const top = scrollY;
      document.addEventListener('astro:after-swap', () => scrollTo({ top, behavior: 'instant' }), { once: true });
      void navigate(to.href, { history: 'replace' });
    });

/**
 * The language links switch the page in place. Read at click time, so the
 * query and the fragment the page carries by then (a map's view, a detail's
 * id) go along. Without scripts the links are plain links and still work.
 */
export const wireLangSwitch = (): void =>
  document.querySelectorAll<HTMLAnchorElement>('.lang-switch a[hreflang]:not([data-wired])').forEach((link) => {
    link.dataset['wired'] = '';
    link.addEventListener('click', (event) =>
      [link.hreflang].filter(isLocale).filter(() => plain(event)).forEach((lang) => {
        event.preventDefault();
        swapTo(lang);
      }),
    );
  });
