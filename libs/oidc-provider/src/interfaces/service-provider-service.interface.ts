import { AnyClientMetadata } from 'oidc-provider';

export interface CustomClientMetadata extends AnyClientMetadata {
  active: boolean;
  name: string;
}

/**
 * Alias and export interface provided by `node-oidc-provider` from our module,
 * so that we do not expose our depency to `node-oidc-provider`.
 */
export type ServiceProviderMetadata = CustomClientMetadata;

export interface IServiceProviderService {
  getList(refreshCache?: boolean): Promise<ServiceProviderMetadata[]>;

  getById(id: string): Promise<ServiceProviderMetadata>;
}
