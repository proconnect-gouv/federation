import type { ClientMetadata } from 'openid-client';
import { Issuer } from 'openid-client';

import {
  Fia1DiscoveryResponseJSON,
  Fia1IdentityProviderDocument,
  MonCompteProDiscoveryResponseJSON,
  MonCompteProIdentityProviderDocument,
} from '@mocks/identity-provider-adapter-mongo';

import type { OidcClientIssuerService } from '../src/services/oidc-client-issuer.service';

/**
 * Configuration for a mock OIDC issuer
 */
export interface MockIssuerConfig {
  /** OIDC Discovery metadata (issuer, endpoints, supported algorithms, etc.) */
  metadata: {
    issuer: string;
    [key: string]: any;
  };
  /** Client registration metadata (client_id, client_secret, redirect_uris, etc.) */
  clientMeta: ClientMetadata;
}

/**
 * Pre-configured mock issuer for FIA1
 */
export const Fia1MockIssuerConfig: MockIssuerConfig = {
  metadata: Fia1DiscoveryResponseJSON,
  clientMeta: {
    client_id: Fia1IdentityProviderDocument.clientID,
    client_secret: Fia1IdentityProviderDocument.client_secret,
    redirect_uris: Fia1IdentityProviderDocument.redirect_uris,
    response_types: Fia1DiscoveryResponseJSON.response_types_supported,
  },
};

/**
 * Pre-configured mock issuer for MonComptePro
 */
export const MonCompteProMockIssuerConfig: MockIssuerConfig = {
  metadata: MonCompteProDiscoveryResponseJSON,
  clientMeta: {
    client_id: MonCompteProIdentityProviderDocument.clientID,
    client_secret: MonCompteProIdentityProviderDocument.client_secret,
    redirect_uris: MonCompteProIdentityProviderDocument.redirect_uris,
    response_types: MonCompteProDiscoveryResponseJSON.response_types_supported,
  },
};

/**
 * Creates a mock OidcClientIssuerService with a configured Issuer
 *
 * @param config - The issuer configuration (use pre-configured Fia1MockIssuerConfig or MonCompteProMockIssuerConfig, or provide a custom configuration)
 * @returns A mock service instance
 *
 * @example
 * ```typescript
 * // Using pre-configured issuer
 * await TestingBench.createTestBench((builder) =>
 *   builder.overrideProvider(OidcClientIssuerService).useValue(
 *     createMockOidcClientIssuerService(MonCompteProMockIssuerConfig)
 *   )
 * );
 *
 * // Using custom configuration for testing edge cases
 * await TestingBench.createTestBench((builder) =>
 *   builder.overrideProvider(OidcClientIssuerService).useValue(
 *     createMockOidcClientIssuerService({
 *       metadata: { ...Fia1DiscoveryResponseJSON, issuer: 'https://custom.example.com' },
 *       clientMeta: {
 *         client_id: 'custom-client',
 *         client_secret: 'custom-secret',
 *         redirect_uris: ['https://custom.example.com/callback'],
 *         response_types: ['code', 'id_token']
 *       }
 *     })
 *   )
 * );
 * ```
 */
export function createMockOidcClientIssuerService(
  config: MockIssuerConfig,
): Partial<OidcClientIssuerService> {
  const issuer = new Issuer(config.metadata);

  return {
    async getClient() {
      const client = new issuer.Client(config.clientMeta);

      return client;
    },
  } as any;
}
