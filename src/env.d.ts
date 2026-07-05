/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  AI: unknown;
  ENVIRONMENT: string;
  CRAWLER_ENABLED: string;
  FIXED_TODAY: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly PUBLIC_FIXED_TODAY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
