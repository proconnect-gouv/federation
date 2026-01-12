import { JWK } from 'jose-v4';
import { Client, custom, Issuer } from 'openid-client';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/core/dto';
import { IdentityProviderMetadata } from '@fc/oidc';

import { OidcClientClass } from '../enums';
import {
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientIssuerDiscoveryFailedException,
} from '../exceptions';
import { IIdentityProviderAdapter } from '../interfaces';
import { IDENTITY_PROVIDER_SERVICE } from '../tokens';
import { OidcClientConfigService } from './oidc-client-config.service';

@Injectable()
export class OidcClientIssuerService implements OnModuleInit {
  private IssuerProxy = Issuer;

  constructor(
    private readonly oidcClientConfigService: OidcClientConfigService,
    private readonly config: ConfigService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderAdapter,
  ) {}

  async onModuleInit() {
    const { httpOptions } = await this.oidcClientConfigService.get();

    custom.setHttpOptionsDefaults(httpOptions);
  }

  /**
   * Get Idp data in idp list.
   *
   * We have to throw a specific error in case of disabled idp
   */
  private async getIdpMetadata(
    issuerId: string,
  ): Promise<IdentityProviderMetadata> {
    const configuration = await this.oidcClientConfigService.get();
    const idpMetadata = configuration.providers.find(
      ({ uid }) => uid === issuerId,
    );
    const supportEmail = await this.getSupportEmail(issuerId);

    if (!idpMetadata) {
      throw new OidcClientIdpNotFoundException(supportEmail);
    }

    if (!idpMetadata.active) {
      throw new OidcClientIdpDisabledException(supportEmail);
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

  async getSupportEmail(idpId: string) {
    const { supportEmail: pcfSupportEmail } = this.config.get<AppConfig>('App');

    const idpMetadata = await this.identityProvider.getById(idpId);
    return idpMetadata.supportEmail || pcfSupportEmail;
  }

  /**
   * @param issuerId identifier used to indicate Chosen IdP
   * @returns providers metadata
   * @throws Error
   */

  private async getIssuer(issuerId: string): Promise<Issuer<Client>> {
    const idpMetadata = await this.getIdpMetadata(issuerId);

    if (idpMetadata.discovery) {
      try {
        return await this.IssuerProxy.discover(idpMetadata.discoveryUrl);
      } catch (error) {
        const supportEmail = await this.getSupportEmail(issuerId);

        throw new OidcClientIssuerDiscoveryFailedException(supportEmail, error);
      }
    }

    return new this.IssuerProxy(idpMetadata.issuer);
  }

  private async getClientClass(): Promise<OidcClientClass> {
    const { fapi } = await this.oidcClientConfigService.get();
    const clientClass = fapi ? OidcClientClass.FAPI : OidcClientClass.STANDARD;

    return clientClass;
  }

  public async getClient(issuerId: string): Promise<Client> {
    const idpMetadata = await this.getIdpMetadata(issuerId);

    const issuer = await this.getIssuer(issuerId);
    const { jwks } = await this.oidcClientConfigService.get();
    const clientClass = await this.getClientClass();

    const client = new issuer[clientClass](
      idpMetadata.client,
      jwks as { keys: JWK[] },
    );

    return client;
  }
}
