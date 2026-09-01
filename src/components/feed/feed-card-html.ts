import { branch } from '../../lib/branch.ts';
import { descriptionOf } from '../../lib/events/description-of.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { eventPath } from '../../lib/event-path.ts';
import { favButtonHtml } from '../../lib/favorites/fav-button.ts';
import { feedCardTags } from './feed-card-tags.ts';
import { feedCardThumb } from './feed-card-thumb.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

const badge = (on: boolean, className: string, label: string): string =>
  branch(on)(
    () => `<span class="${className}">${escapeMarkup(label)}</span>`,
    () => '',
  );

const descHtml = (desc: string): string =>
  branch(desc === '')(
    () => '',
    () => `<p class="mini-desc">${escapeMarkup(desc)}</p>`,
  );

/** A card matching the server-rendered markup, for an event published since the
 *  build — the same DOM the filter and the search index already read. */
export const feedCardHtml = (context: FeedContext, event: CompactEvent): string => {
  const { lang, ui, icons } = context;
  return (
    `<a class="mini-card" href="${localizedUrl(lang, eventPath(event))}">` +
    favButtonHtml(event.id, ui.nav.favorites) +
    feedCardThumb(event, icons) +
    `<div class="mini-body"><h4 class="mini-title">${escapeMarkup(titleOf(lang)(event))}</h4>` +
    `<span class="mini-when">${escapeMarkup(formatWhen(event))}</span>` +
    descHtml(descriptionOf(lang)(event)) +
    `<div class="mini-tags">${feedCardTags(event, ui, icons)}` +
    `${badge(event.f === true, 'badge-free', ui.badges.free)}` +
    `${badge(event.x === true, 'badge-gem', ui.badges.gem)}` +
    `${badge(event.pl === true, 'badge-made', ui.badges.made)}</div></div></a>`
  );
};
