const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** One entry: a page, its title, when it happens and what it is. */
/** The channel: where it points, and where the feed itself lives. */
export type RssChannel = Readonly<{ title: string; link: string; self: string; description: string }>;

export type RssItem = Readonly<{
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}>;

const itemXml = (item: RssItem): string =>
  `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.link)}</link>` +
  `<guid isPermaLink="false">${escapeXml(item.guid)}</guid>` +
  `<pubDate>${escapeXml(item.pubDate)}</pubDate>` +
  `<description>${escapeXml(item.description)}</description></item>`;

/** An RSS 2.0 document. Aggregators and the Telegram/Discord bots other people
 *  run are a distribution channel we do not have to build or operate. */
export const rssXml = (channel: RssChannel, items: readonly RssItem[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
  `<title>${escapeXml(channel.title)}</title>` +
  `<link>${escapeXml(channel.link)}</link>` +
  `<description>${escapeXml(channel.description)}</description>` +
  // rel="self" must be the feed's own address, not the page it describes —
  // validators reject the other thing and some readers follow it.
  `<atom:link href="${escapeXml(channel.self)}" rel="self" type="application/rss+xml"/>` +
  items.map(itemXml).join('') +
  `</channel></rss>`;
