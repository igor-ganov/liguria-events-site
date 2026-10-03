/** What Cloudflare says about where a request came from. */
export type Geo = Readonly<{ region: string | undefined; country: string | undefined }>;
