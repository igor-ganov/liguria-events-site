/** An authenticated person. `admin` may moderate/delete; `member` may submit. */
export type AppUser = {
  id: string;
  email: string;
  handle: string;
  role: 'member' | 'admin';
};
