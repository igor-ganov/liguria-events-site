import type { AppUser } from './types.ts';

/** The columns every user read selects, in the order `toUser` expects. */
export type UserRow = { id: string; email: string; handle: string; role: string; banned: number };

/** An account plus the tally of what it has submitted (admin view). */
export type AdminUserRow = AppUser & {
  created_at: string;
  banned_reason: string | null;
  published: number;
  pending: number;
  rejected: number;
};

/** The raw admin listing row from D1, before `toUser` shapes it. */
export type AdminListRow = UserRow & {
  created_at: string;
  banned_reason: string | null;
  published: number;
  pending: number;
  rejected: number;
};
