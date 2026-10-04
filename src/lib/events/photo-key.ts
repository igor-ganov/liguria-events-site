const HOST = /^https?:\/\/([^/]+)/;
const FILE = /\/([^/?#]+)(?:[?#].*)?$/;

/**
 * What makes two addresses the same photograph: the host and the file name.
 *
 * A source lists a file as its cover and serves the same file again in its
 * slider from another size folder and with another query, so comparing whole
 * addresses shows one picture twice. The host stays in the key because two
 * sources both calling a file "cover.jpg" are not the same picture.
 */
export const photoKey = (url: string): string => `${HOST.exec(url)?.[1] ?? ''}/${FILE.exec(url)?.[1] ?? url}`;
