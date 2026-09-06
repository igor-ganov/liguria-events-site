/**
 * One submission waiting to be sent.
 *
 * `title` is carried so the queue can be talked about — "Concerto in cortile
 * is waiting to publish" rather than "1 item pending". `base` is the version
 * an edit was made against, and it is what makes a conflict detectable when
 * the entry is finally sent, hours later.
 */
export type OutboxEntry = Readonly<{
  id: string;
  url: string;
  method: 'POST' | 'PATCH';
  body: string;
  title: string;
  createdAt: number;
  state: 'waiting' | 'conflicted';
}>;
