/**
 * The one wait ceiling in the kit.
 *
 * Every wait is event-driven; this is only the line past which a wait is
 * declared a hang rather than slowness. A spec never sets its own — a per-spec
 * number hides whether that spec is slow or broken — and CI raises this one
 * through the environment.
 */
export const CEILING_MS = Number(process.env.E2E_MAX_WAIT_MS ?? 10_000);
