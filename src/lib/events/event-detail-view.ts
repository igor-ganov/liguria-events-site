import { absoluteImage } from '../img/absolute-image.ts';
import { branch } from '../branch.ts';
import { clipText } from '../seo/clip-text.ts';
import { socialImageUrl } from '../img/social-image-url.ts';
import { canonicalUrl } from '../seo/canonical-url.ts';
import { descriptionArticleHtml } from '../description/description-article-html.ts';
import { descriptionOf } from './description-of.ts';
import { descriptionPlain } from '../description/description-plain.ts';
import { ARCHIVE_COVER } from './archive-cover-url.ts';
import { archivedCover } from './archive-cover.ts';
import { eventGallery } from './event-gallery.ts';
import { eventJsonLd } from './event-jsonld.ts';
import { eventLinks } from './event-links.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from './is-upcoming.ts';
import { mapQuery } from './map-query.ts';
import { regionOf } from '../region/region-of.ts';
import { ticketUrl } from './ticket-link.ts';
import { titleOf } from './title-of.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

type Input = Readonly<{
  lang: Locale;
  event: CompactEvent;
  address: string | undefined;
  site: URL | undefined;
  today: string;
}>;

const mapUrls = (event: CompactEvent) => {
  const query = mapQuery(event);
  return {
    mapSearchUrl: query && `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    mapEmbedUrl: query && `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`,
  };
};

/** Everything the event page renders, derived in one place so the component
 *  stays markup. The description is light Markdown: the body renders it as a
 *  structured article, meta and structured data get the plain-text form. */
export const eventDetailView = ({ lang, event, address, site, today }: Input) => {
  const title = titleOf(lang)(event);
  const desc = descriptionOf(lang)(event);
  const descMeta = descriptionPlain(desc);
  const image = absoluteImage(event.img, site);
  const url = canonicalUrl(lang, eventPath(event), site);
  const gallery = eventGallery(event);
  // Read once: what the page shows at the top and what a share of it shows
  // both change when the night is over.
  const passed = !isUpcoming(today)(event);
  const shown = archivedCover(gallery, passed);
  return {
    region: regionOf(event),
    title,
    desc,
    descHtml: descriptionArticleHtml(desc),
    descMeta,
    // An event with no photo of its own gets a card drawn from what it says —
    // title, when, where — rather than the same rectangle as everything else.
    // One that is over gets the archive mark, so a link shared today does not
    // promise a square full of people that emptied a week ago.
    heroImage: branch(passed)(
      () => socialImageUrl(ARCHIVE_COVER, site, ARCHIVE_COVER),
      () => socialImageUrl(event.img, site, `/og/${event.id}.png`),
    ),
    descPreview: clipText(descMeta, 200),
    cover: shown[0],
    more: shown.slice(1),
    links: eventLinks(event),
    tickets: ticketUrl(event),
    // The page of an event that has happened is kept — the link somebody
    // shared has to keep working — so it must say so.
    passed,
    jsonLd: eventJsonLd({ event, title, desc: descMeta, image, address, url }),
    ...mapUrls(event),
  };
};
