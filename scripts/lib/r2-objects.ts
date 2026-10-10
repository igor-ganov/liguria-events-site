/*
 * The two things the thumbnail build asks of an R2 bucket — which objects are
 * under a prefix, and to store one more — over Cloudflare's REST API, with the
 * account credentials the deploy already holds.
 */
import { Schema } from 'effect';

export type R2Access = Readonly<{ account: string; email: string; key: string; bucket: string }>;

const ListingSchema = Schema.Struct({
  result: Schema.optional(Schema.Array(Schema.Struct({ key: Schema.String }))),
  result_info: Schema.optional(
    Schema.Struct({ cursor: Schema.optional(Schema.String), is_truncated: Schema.optional(Schema.Boolean) }),
  ),
});
type Listing = typeof ListingSchema.Type;

const base = (access: R2Access): string =>
  `https://api.cloudflare.com/client/v4/accounts/${access.account}/r2/buckets/${access.bucket}/objects`;

const auth = (access: R2Access): Readonly<Record<string, string>> => ({
  'X-Auth-Email': access.email,
  'X-Auth-Key': access.key,
});

const page = async (access: R2Access, prefix: string, cursor: string): Promise<Listing> => {
  const query = new URLSearchParams({ prefix, per_page: '1000', ...(cursor === '' ? {} : { cursor }) });
  const res = await fetch(`${base(access)}?${query}`, { headers: auth(access) });
  if (!res.ok) throw new Error(`listing ${prefix} answered ${res.status}`);
  return Schema.decodeUnknownSync(ListingSchema)(await res.json());
};

/** Every key under `prefix`, however many pages the bucket answers in. */
export const listKeys = async (access: R2Access, prefix: string, cursor = ''): Promise<readonly string[]> => {
  const listing = await page(access, prefix, cursor);
  const keys = (listing.result ?? []).map((object) => object.key);
  const next = listing.result_info?.is_truncated === true ? (listing.result_info.cursor ?? '') : '';
  return next === '' ? keys : [...keys, ...(await listKeys(access, prefix, next))];
};

/** Store one object. Throws when the bucket does not take it. */
export const putObject = async (access: R2Access, key: string, body: Uint8Array, type: string): Promise<void> => {
  const res = await fetch(`${base(access)}/${key}`, {
    method: 'PUT',
    headers: { ...auth(access), 'content-type': type },
    body,
  });
  if (!res.ok) throw new Error(`storing ${key} answered ${res.status}`);
};
