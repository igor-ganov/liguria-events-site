import { isTransitionBeforePreparationEvent } from 'astro:transitions/client';
import { branch } from '../../lib/branch.ts';
import { isLocale } from '../../lib/i18n/is-locale.ts';
import { langSwapUrl } from '../../lib/i18n/lang-swap-url.ts';
import { langChoice } from './lang-choice.ts';

const pageLang = (): string => document.documentElement.lang;
const known = (url: URL | undefined): url is URL => url !== undefined;

// The page a history step points at, in the language the tab is read in.
const inChoice = (url: URL): URL | undefined =>
  [langChoice.read()].filter(isLocale).map((lang) => langSwapUrl(url, lang)).at(0);

// A step this document walks itself: the router is about to fetch it, and
// fetches it in the chosen language instead.
const steerTraverse = (event: Event): void =>
  [event]
    .filter(isTransitionBeforePreparationEvent)
    .filter((step) => step.navigationType === 'traverse')
    .forEach((step) => {
      step.to = inChoice(step.to) ?? step.to;
    });

// The router keeps the address of the step it walked, so after a steered step
// the bar still names the old language: it is given the page's own. Whatever
// page is now on screen is the language the tab is read in from here on.
const settle = (): void => {
  [pageLang()]
    .filter(isLocale)
    .map((lang) => langSwapUrl(new URL(location.href), lang))
    .filter(known)
    .forEach((own) => history.replaceState(history.state, '', own.href));
  langChoice.keep(pageLang());
};

// A step across documents: the browser, not the router, brought this page
// back — from its cache or from the server — in whatever language it was left.
const walkedBack = (event: PageTransitionEvent): boolean =>
  event.persisted ||
  performance
    .getEntriesByType('navigation')
    .some((entry) => entry instanceof PerformanceNavigationTiming && entry.type === 'back_forward');

const arrive = (event: PageTransitionEvent): void =>
  branch(walkedBack(event))(
    () => [inChoice(new URL(location.href))].filter(known).forEach((to) => location.replace(to.href)),
    () => langChoice.keep(pageLang()),
  );

/**
 * A language is a setting, not a place: Back and Forward lead to the pages
 * behind and ahead in the language the reader chose, wherever they chose it.
 */
export const followLangChoice = (): void => {
  document.addEventListener('astro:before-preparation', steerTraverse);
  document.addEventListener('astro:after-swap', settle);
  addEventListener('pageshow', arrive);
};
