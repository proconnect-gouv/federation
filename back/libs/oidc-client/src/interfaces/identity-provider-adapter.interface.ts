import { ClientMetadata, IssuerMetadata } from '../dto';

/**
 * Alias and export interface provided by `openid-client` from our module,
 * so that we do not expose our depency to `openid-client`.
 */
/**
 * @todo #429 améliorer le typage pour affiner l'ajout de données (FeatureHandler...)
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/429
 */
export type IdentityProviderMetadata<
  T = { [key: string]: any }
> = ClientMetadata & IssuerMetadata & T;

export interface IIdentityProviderAdapter {
  getList<T = Record<string, any>>(
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata<T>[]>;

  getById<T = Record<string, any>>(
    id: string,
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata<T>>;
}
