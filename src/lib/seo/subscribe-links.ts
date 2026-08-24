/** A feed a reader can subscribe to, as the head advertises it. */
export type SubscribeLink = Readonly<{ type: string; href: string; title: string }>;

// The collector serves the calendar; the site serves the RSS.
const ICS_URL = 'https://liguria-events-bot.igor-ganov.workers.dev/calendar.ics';

/**
 * The feeds for a region, for `<link rel="alternate">`.
 *
 * A calendar subscription survives without the reader ever visiting again,
 * and an RSS feed is read by aggregators and by the Telegram and Discord bots
 * other people run — distribution we neither build nor operate. Neither was
 * discoverable from anywhere but one menu item.
 */
export const subscribeLinks = (
  region: string | undefined,
  site: URL | undefined,
  city?: string | undefined,
): readonly SubscribeLink[] =>
  [region ?? '']
    .filter((slug) => slug !== '')
    // A reader on a city page wants that city, not the whole region.
    .map((slug) => [slug, city ?? ''].filter((part) => part !== '').join('/'))
    .flatMap((path) => [
      {
        type: 'application/rss+xml',
        href: new URL(`/${path}/rss.xml`, site).toString(),
        title: 'Upcoming events (RSS)',
      },
      { type: 'text/calendar', href: ICS_URL, title: 'Upcoming events (calendar)' },
    ]);
