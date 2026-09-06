/**
 * The page a document is asking about, read out of its message.
 *
 * Decoded rather than trusted: this arrives by postMessage, which anything
 * running in the page can send.
 */
export const stateRequest = (data: unknown): string | undefined =>
  [data]
    .filter((message): message is Readonly<Record<string, unknown>> => typeof message === 'object' && Boolean(message))
    .filter((message) => message['kind'] === 'state')
    .map((message) => message['url'])
    .filter((url): url is string => typeof url === 'string')
    .at(0);
