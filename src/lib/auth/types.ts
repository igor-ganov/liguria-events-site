/** An authenticated person. `admin` may moderate/delete; `member` may submit.
 *  A banned person keeps their row (and the authorship of their events) but
 *  may do neither. */
export type AppUser = {
  id: string;
  email: string;
  handle: string;
  role: 'member' | 'admin';
  banned: boolean;
};
