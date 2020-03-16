import { ClientMetadata } from 'openid-client';

/**
 * Alias and export interface provided by `openid-client` from our module,
 * so that we do not expose our depency to `openid-client`.
 */
export type IdPMetadata = ClientMetadata;

export interface IIdPManagementService {
  getList(): Promise<IdPMetadata[]>;
}
