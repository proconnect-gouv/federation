import { IdentityProviderMetadata } from "@fc/oidc";

export abstract class IdentityProviderAdapter {
  abstract getById(
    id: string,
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata>;

  abstract getList(refreshCache?: boolean): Promise<IdentityProviderMetadata[]>;

  abstract isActiveById(id: string): Promise<boolean>;

  abstract refreshCache(): Promise<void>;

  abstract getFqdnFromEmail(email: string | undefined): string | undefined;

  abstract getIdpsByEmail(email: string): Promise<IdentityProviderMetadata[]>;

  abstract getIdpsByFqdn(fqdn: string): Promise<IdentityProviderMetadata[]>;
}
