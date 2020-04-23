import { AnyClientMetadata } from 'oidc-provider';

/**
 * Alias and export interface provided by `node-oidc-provider` from our module,
 * so that we do not expose our depency to `node-oidc-provider`.
 */
export type ServiceProviderMetadata = AnyClientMetadata;

export interface IServiceProviderService {
  isUsable(id: string): Promise<boolean>;

  getList(): Promise<ServiceProviderMetadata[]>;
}
