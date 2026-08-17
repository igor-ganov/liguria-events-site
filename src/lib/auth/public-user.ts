import type { AppUser } from './types.ts';

/** The slice of an account that may leave the server: identity and role, never
 *  the internal id or the ban flag. */
export const publicUser = (user: AppUser): Readonly<{ email: string; handle: string; role: AppUser['role'] }> => ({
  email: user.email,
  handle: user.handle,
  role: user.role,
});
