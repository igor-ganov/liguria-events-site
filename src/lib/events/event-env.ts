/**
 * The bindings the event write-path needs, declared structurally. Files under
 * `src/lib` are type-checked by tsconfig.test.json, which does not see Astro's
 * generated ambient `Env` — so, as elsewhere in this folder, the module states
 * exactly what it uses. It is a superset-compatible view of the real `Env`.
 */
export type EventEnv = Readonly<{
  DB: D1Database;
  AI: unknown;
  RESEND_API_KEY: string;
  MAIL_FROM: string;
}>;
