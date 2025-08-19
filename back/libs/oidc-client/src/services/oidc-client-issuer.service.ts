import { JWK } from 'jose-v4';
import { ClientMetadata, Configuration, discovery } from 'openid-client-v6';

import { Injectable } from '@nestjs/common';

import { IdentityProviderMetadata } from '@fc/oidc';

import { OidcClientClass } from '../enums';
import {
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
} from '../exceptions';
import { OidcClientConfigService } from './oidc-client-config.service';

@Injectable()
export class OidcClientIssuerService {
  private IssuerProxy = { discover: discovery };

  constructor(private readonly config: OidcClientConfigService) {}

  /**
   * Get Idp data in idp list.
   *
   * We have to throw a specific error in case of disabled idp
   */
  private async getIdpMetadata(
    issuerId: string,
  ): Promise<IdentityProviderMetadata> {
    const configuration = await this.config.get();
    const idpMetadata = configuration.providers.find(
      ({ uid }) => uid === issuerId,
    );

    if (!idpMetadata) {
      throw new OidcClientIdpNotFoundException();
    }

    if (!idpMetadata.active) {
      throw new OidcClientIdpDisabledException();
    }

    const { redirectUri, postLogoutRedirectUri } = configuration;

    const result = {
      ...idpMetadata,
      client: {
        ...idpMetadata.client,

        redirect_uris: [redirectUri],
        post_logout_redirect_uris: [postLogoutRedirectUri],
      },
    };

    return result;
  }

  /**
   * @param issuerId identifier used to indicate Chosen IdP
   * @returns providers metadata
   * @throws Error
   */
  private async getIssuer(issuerId: string): Promise<Configuration> {
    const idpMetadata = await this.getIdpMetadata(issuerId);
    const clientMeta = idpMetadata.client as ClientMetadata;

    if (idpMetadata.discovery) {
      return discovery(new URL(idpMetadata.discoveryUrl), idpMetadata.client.client_id, clientMeta);
    }

    throw Error("discovery required");
  }

  private async getClientClass(): Promise<OidcClientClass> {
    const { fapi } = await this.config.get();
    const clientClass = fapi ? OidcClientClass.FAPI : OidcClientClass.STANDARD;

    return clientClass;
  }

  public async getClient(issuerId: string): Promise<Configuration> {
    const idpMetadata = await this.getIdpMetadata(issuerId);

    const issuer = await this.getIssuer(issuerId);
    const { jwks } = await this.config.get();
    const clientClass = await this.getClientClass();

    return issuer;

    const client = new issuer[clientClass](
      idpMetadata.client,
      jwks as { keys: JWK[] },
    );
  }
}
