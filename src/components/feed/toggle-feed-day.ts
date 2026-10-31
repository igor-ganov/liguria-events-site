import { feedToday } from './feed-today.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { readStored } from './read-stored.ts';
import { setDayShut } from './set-day-shut.ts';
import { SHUT_KEY } from './shut-key.ts';
import { shutDaysOf } from './shut-days-of.ts';
import { toggleShutDay } from './toggle-shut-day.ts';
import { writeStored } from './write-stored.ts';

// A day folded from its stuck heading would leave the reader somewhere further
// down the feed; its strip is brought back under the site header instead.
const keepInSight = (group: HTMLElement): void => {
  [group].filter((day) => day.getBoundingClientRect().top < 0).forEach((day) => day.scrollIntoView({ block: 'start' }));
};

const toggle = (button: Element): void => {
  const group = button.closest<HTMLElement>('.feed-group') ?? undefined;
  [group].filter(isDefined).forEach((day) => {
    const shut = button.getAttribute('aria-expanded') === 'true';
    setDayShut(day, shut);
    const days = toggleShutDay(shutDaysOf(readStored(SHUT_KEY), feedToday()), day.dataset['day'] ?? '', shut);
    writeStored(SHUT_KEY, JSON.stringify(days));
    [day].filter(() => shut).forEach(keepInSight);
  });
};

/** A click that lands on a day's button folds or opens that day — one listener
 *  for every day, the folded-away ones and those opened later included. */
export const toggleFeedDay = (event: Event): void => {
  [event.target]
    .filter((target): target is Element => target instanceof Element)
    .map((target) => target.closest('[data-day-toggle]') ?? undefined)
    .filter(isDefined)
    .forEach(toggle);
};
