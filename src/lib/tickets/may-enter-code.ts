import type { AppUser } from '../auth/types.ts';

/** Only the reader who made the claim may type its code in: the staff have no
 *  need of one, and nobody else has any business with the thread. */
export const mayEnterCode = (user: AppUser | undefined, ticket: Readonly<{ userId: string }>): boolean => user?.id === ticket.userId;
