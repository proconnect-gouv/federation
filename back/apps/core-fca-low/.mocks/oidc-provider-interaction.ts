import type Redis from "ioredis";

import { Fsa1ServiceProviderDocument } from "@mocks/service-provider-adapter-mongo";

export async function seedInteraction(
  redis: Redis,
  interactionId: string,
  interaction: Record<string, unknown>,
): Promise<void> {
  await redis.set(
    `OIDC-P:Interaction:${interactionId}`,
    JSON.stringify(interaction),
  );
}

/**
 * Minimal oidc-provider Interaction shape for a fresh "login" prompt
 * against Fsa1ServiceProviderDocument. Pass `overrides` to merge into
 * `params` (e.g. `idp_hint`, `login_hint`).
 */
export function defaultInteraction(
  jti: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    jti,
    params: {
      client_id: Fsa1ServiceProviderDocument.key,
      state: "test-state",
      scope: "openid email",
      ...overrides,
    },
    prompt: { name: "login", reasons: [] },
  };
}
