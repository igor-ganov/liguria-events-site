import { branch } from '../../lib/branch.ts';
import { descriptionOf } from '../../lib/events/description-of.ts';
import { descriptionPlain } from '../../lib/description/description-plain.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { eventPath } from '../../lib/event-path.ts';
import { favButtonHtml } from '../../lib/favorites/fav-button.ts';
import { feedCardTags } from './feed-card-tags.ts';
import { feedCardThumb } from './feed-card-thumb.ts';
import { feedCardVenue } from './feed-card-venue.ts';
import { feedCardWhen } from './feed-card-when.ts';
import { spriteUse } from '../../lib/icons/sprite-use.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

const badge = (on: boolean, className: string, label: string): string =>
  branch(on)(
    () => `<span class="${className}">${escapeMarkup(label)}</span>`,
    () => '',
  );

// Not shown, and still in the document: the search reads the rendered cards,
// so a description taken out of the markup would be taken out of the search.
const descHtml = (desc: string): string =>
  branch(desc === '')(
    () => '',
    () => `<p class="mini-desc" hidden>${escapeMarkup(desc)}</p>`,
  );

/** The feed card: a photograph with the hour, the title and the place on it.
 *  ONE builder for the server-rendered feed and for an event published since
 *  the build, so the two can never drift apart. */
export const feedCardHtml = (context: FeedContext, event: CompactEvent): string => {
  const { lang, ui, icons } = context;
  return (
    `<a class="photo-card" href="${localizedUrl(lang, eventPath(event))}">` +
    favButtonHtml(event.id, ui.nav.favorites, undefined, spriteUse('heart', 18, 'fav-glyph')) +
    feedCardThumb(event) +
    `<header class="photo-card-top">${feedCardTags(event, ui, icons)}` +
    `${badge(event.f === true, 'badge-free', ui.badges.free)}` +
    `${badge(event.x === true, 'badge-gem', ui.badges.gem)}` +
    `${badge(event.pl === true, 'badge-made', ui.badges.made)}</header>` +
    `<footer class="photo-card-text">${feedCardWhen(event)}` +
    `<h4 class="mini-title photo-card-title">${escapeMarkup(titleOf(lang)(event))}</h4>` +
    `${feedCardVenue(event)}${descHtml(descriptionPlain(descriptionOf(lang)(event)))}</footer></a>`
  );
};
