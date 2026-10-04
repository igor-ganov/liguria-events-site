import type { AppUser } from '../auth/types.ts';

/** A thread is between one reader and the staff: the reader who opened it may
 *  read it, an admin may, and nobody else — signed in or not. */
export const mayReadTicket = (user: AppUser | undefined, ticket: Readonly<{ userId: string }>): boolean =>
  [user].some((reader) => reader !== undefined && (reader.role === 'admin' || reader.id === ticket.userId));
