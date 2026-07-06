/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  SESSION: KVNamespace;
  AI: unknown;
  ENVIRONMENT: string;
  CRAWLER_ENABLED: string;
  FIXED_TODAY: string;
  RESEND_API_KEY: string;
  SESSION_SECRET: string;
  PASSKEY_RP_ID: string;
  PASSKEY_ORIGIN: string;
  PUBLIC_ORIGIN: string;
  MAIL_FROM: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: import('./lib/auth/types').AppUser;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_FIXED_TODAY?: string;
  readonly PUBLIC_PMTILES_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
