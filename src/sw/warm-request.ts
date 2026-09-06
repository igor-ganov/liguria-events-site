/**
 * The links a page asked the worker to have ready, read out of its message.
 *
 * Decoded rather than trusted: this arrives by postMessage, which anything
 * running in the page can send, and a list of strings is the only shape that
 * does anything here.
 */
export const warmRequest = (data: unknown): readonly string[] =>
  [data]
    .filter((message): message is Readonly<Record<string, unknown>> => typeof message === 'object' && Boolean(message))
    .filter((message) => message['kind'] === 'warm')
    .map((message) => message['links'])
    .filter((links): links is readonly unknown[] => Array.isArray(links))
    .flatMap((links) => links.filter((link): link is string => typeof link === 'string'))
    .slice(0, 40);
