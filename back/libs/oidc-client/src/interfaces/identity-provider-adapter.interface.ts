import { IdentityProviderMetadata } from '@fc/oidc';

export interface IIdentityProviderAdapter {
  getById(
    id: string,
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata>;

  getFilteredList(
    idpList: string[],
    blacklist: boolean,
  ): Promise<IdentityProviderMetadata[]>;

  getList(refreshCache?: boolean): Promise<IdentityProviderMetadata[]>;

  isActiveById(id: string): Promise<boolean>;

  refreshCache(): Promise<void>;
}
