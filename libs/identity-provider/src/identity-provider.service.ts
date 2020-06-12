import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validateDto, asyncFilter } from '@fc/common';
import { validationOptions } from '@fc/config';
import {
  IdentityProviderMetadata,
  IIdentityProviderService,
} from '@fc/oidc-client';
import { CryptographyService } from '@fc/cryptography';
import { IIdentityProvider } from './interfaces';
import { IdentityProviderDTO } from './dto';
import { LoggerService } from '@fc/logger';

@Injectable()
export class IdentityProviderService implements IIdentityProviderService {
  private listCache: IdentityProviderMetadata[];

  constructor(
    @InjectModel('IdentityProvider')
    private readonly identityProviderModel,
    private readonly cryptography: CryptographyService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  private async findAllIdentityProvider(): Promise<IIdentityProvider[]> {
    const rawResult = await this.identityProviderModel
      .find(
        {},
        {
          _id: false,
          uid: true,
          name: true,
          active: true,
          display: true,
          clientID: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: true,
          discoveryUrl: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uris: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          post_logout_redirect_uris: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_types: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          token_endpoint_auth_method: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          revocation_endpoint_auth_method: true,
        },
      )
      .exec();

    const result: any = await asyncFilter(rawResult, async ({ _doc }) => {
      const errors = await validateDto(
        _doc,
        IdentityProviderDTO,
        validationOptions,
      );

      if (errors.length > 0) {
        this.logger.warn(
          `"${_doc.uid}" was excluded from the result at DTO validation`,
        );
      }

      return errors.length === 0;
    });

    return result.map(({ _doc }) => _doc);
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<IdentityProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      const list: IIdentityProvider[] = await this.findAllIdentityProvider();

      this.listCache = list.map(this.legacyToOpenIdPropertyName.bind(this));
    }
    return this.listCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata> {
    const providers = await this.getList(refreshCache);

    return providers.find(({ uid }) => uid === id);
  }

  private legacyToOpenIdPropertyName(
    source: IIdentityProvider,
  ): IdentityProviderMetadata {
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_id = source.clientID;
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_secret = this.cryptography.decryptClientSecret(
      source.client_secret,
    );

    const result = {
      ...source,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret,
    };

    delete result.clientID;

    return result as IdentityProviderMetadata;
  }
}
