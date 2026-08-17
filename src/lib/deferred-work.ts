/**
 * The only part of Cloudflare's ExecutionContext this app uses: a way to keep
 * post-response work alive. Typing it structurally (rather than importing
 * `ExecutionContext`) sidesteps the two copies of @cloudflare/workers-types in
 * the tree — Astro's adapter bundles its own, and under
 * `exactOptionalPropertyTypes` the two are nominally incompatible even though
 * they are identical.
 */
export type DeferredWork = Readonly<{ waitUntil: (work: Promise<unknown>) => void }>;
