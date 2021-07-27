import { Issuer, Client, custom } from 'openid-client';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';
import {
  OidcClientProviderNotFoundException,
  OidcClientProviderDisabledException,
} from '../exceptions';
import { OidcClientConfigService } from './oidc-client-config.service';

@Injectable()
export class OidcClientIssuerService {
  private IssuerProxy = Issuer;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: OidcClientConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  private getHttpOptions(configOptions: object, givenOptions: object): object {
    return { ...givenOptions, ...configOptions };
  }

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
      throw new OidcClientProviderNotFoundException();
    }

    if (!idpMetadata.active) {
      throw new OidcClientProviderDisabledException();
    }

    return idpMetadata;
  }

  /**
   * @param issuerId identifier used to indicate choosen IdP
   * @returns providers metadata
   * @throws Error
   */
  private async getIssuer(issuerId: string): Promise<Issuer<Client>> {
    const idpMetadata = await this.getIdpMetadata(issuerId);

    if (idpMetadata.discovery) {
      /**
       * @TODO #142 handle network failure with specific Exception / error code
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/142
       */
      const issuer = await this.IssuerProxy.discover(idpMetadata.discoveryUrl);

      return issuer;
    }

    return new this.IssuerProxy(idpMetadata.issuer);
  }

  public async getClient(issuerId: string): Promise<Client> {
    const idpMetadata = await this.getIdpMetadata(issuerId);

    const issuer = await this.getIssuer(issuerId);
    const { jwks, httpOptions } = await this.config.get();

    const client = new issuer.Client(idpMetadata.client, jwks);

    client[custom.http_options] = this.getHttpOptions.bind(this, httpOptions);
    return client;
  }
}
