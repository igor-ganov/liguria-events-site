/** Where the words come from when a push wakes the worker: read now rather
 *  than encrypted into the message an hour ago, so a reader sees what is on
 *  today and not what was on when the send started. */
const DIGEST = 'https://liguria-events-bot.igor-ganov.workers.dev/digest.json';

type Notice = Readonly<{ title: string; body: string; url: string }>;

const asNotice = (value: unknown): Notice | undefined =>
  [value]
    .filter((found): found is Record<string, unknown> => typeof found === 'object' && found !== null)
    .filter((found) => typeof found['title'] === 'string' && found['title'] !== '')
    .map((found) => ({
      title: String(found['title']),
      body: String(found['body'] ?? ''),
      url: String(found['url'] ?? '/'),
    }))
    .at(0);

/**
 * What a woken device shows.
 *
 * Nothing to say means nothing shown — and a push that arrives on a quiet day
 * simply does not become a notification. (Chrome may show its own "this site
 * was updated in the background" if a push is ignored entirely, which is why
 * the sender skips quiet days rather than relying on this.)
 */
export const showDigest = async (
  show: (title: string, options: Record<string, unknown>) => Promise<void>,
  place: string,
  lang: string,
): Promise<void> => {
  const answer = await fetch(`${DIGEST}?place=${encodeURIComponent(place)}&lang=${encodeURIComponent(lang)}`)
    .then((response) => response.json())
    .catch(() => undefined);
  await Promise.all(
    [asNotice(answer)]
      .filter((notice) => notice !== undefined)
      .map((notice) =>
        show(notice.title, {
          body: notice.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'dovego-daily',
          data: { url: notice.url },
        }),
      ),
  );
};
