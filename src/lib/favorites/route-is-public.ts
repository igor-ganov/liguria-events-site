import { jsonValue } from '../json-value.ts';

/** Anonymous routes are always public (a shareable unique link is the only way
 *  back to them); an owner's route is private unless `public: true` was sent. */
export const routeIsPublic = (signedIn: boolean, body: unknown): boolean =>
  !signedIn || jsonValue(body, 'public') === true;
