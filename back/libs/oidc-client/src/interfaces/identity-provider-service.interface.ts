import { ClientMetadata } from 'openid-client';

/**
 * Alias and export interface provided by `openid-client` from our module,
 * so that we do not expose our depency to `openid-client`.
 */
export type IdentityProviderMetadata = ClientMetadata;

export interface IIdentityProviderService {
  getList(refeshCache?: boolean): Promise<IdentityProviderMetadata[]>;

  getById(id: string, refeshCache?: boolean): Promise<any>;
}
