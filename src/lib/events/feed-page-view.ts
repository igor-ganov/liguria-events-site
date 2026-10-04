import { cachedEvents } from '../../data/cached-events.ts';
import { dayHeading } from '../calendar/day-heading.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { feedExtras } from './feed-extras.ts';
import { feedViewModel } from './feed-view-model.ts';
import { isoToday } from '../calendar/iso-today.ts';
import { socialImage } from './social-image.ts';
import { socialImageUrl } from '../img/social-image-url.ts';
import type { FeedScope } from './feed-events.ts';
import type { Locale } from '../i18n/locales.ts';
import type { Ui } from '../i18n/ui-schema.ts';

type Input = Readonly<{
  lang: Locale;
  scope: Omit<FeedScope, 'today'>;
  today: string | undefined;
  site: URL | undefined;
  ui: Ui;
}>;

/**
 * Everything a feed page shows, derived in one call.
 *
 * The template had grown into a page of derivation — a corpus fetch, a view
 * model, a social image, a day heading and two SEO extras — which is how a
 * layout file ends up being read for its logic. Here it is one function and the
 * component is markup again.
 */
export const feedPageView = async ({ lang, scope: given, today: when, site, ui }: Input) => {
  const payload = await cachedEvents(EVENTS_URL);
  const today = when ?? isoToday();
  const scope = { ...given, today };
  const view = feedViewModel({ lang, scope, events: payload.events, today, ui });
  return {
    ...view,
    ...feedExtras({ lang, scope, corpus: payload.events, shown: view.events, path: view.path, site }),
    today,
    heading: dayHeading(ui),
    // A shared link with no picture arrives as a grey rectangle, so every feed
    // page takes the cover of its soonest event, cropped to preview size.
    image: socialImageUrl(socialImage(view.events), site),
  };
};
