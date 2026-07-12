/** Cloudflare Workers Static Assets allows only ONE `*` per URL pattern and
 *  silently ignores a rule that breaks it — a dropped rule is a 404 that
 *  nothing reports. */
export const splatCount = (pattern: string): number => (pattern.match(/\*/g) ?? []).length;
