import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request } from 'express';
import { IdTokenClaims, TokenSet } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

import { TokenResultDto } from '../dto';
import { OidcClientTokenResultFailedException } from '../exceptions';
import {
  ExtraTokenParams,
  TokenParams,
  TokenResults,
  UserInfosParams,
} from '../interfaces';
import { OidcClientIssuerService } from './oidc-client-issuer.service';
import { OidcClientUtilsService } from './oidc-client-utils.service';

@Injectable()
export class OidcClientService {
  constructor(
    public readonly utils: OidcClientUtilsService,
    private readonly issuer: OidcClientIssuerService,
    private readonly logger: LoggerService,
  ) {}

  async getToken(
    idpId: string,
    params: TokenParams,
    req: Request,
    extraParams?: ExtraTokenParams,
  ): Promise<TokenResults> {
    // OIDC: call idp's /token endpoint
    const tokenSet: TokenSet = await this.utils.getTokenSet(
      req,
      idpId,
      params,
      extraParams,
    );

    const {
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
    } = tokenSet;
    const claims: IdTokenClaims = tokenSet.claims();

    this.logger.info({
      code: `oidc-client-info:get-token`,
      claims,
    });

    const tokenResult = plainToInstance(TokenResultDto, {
      accessToken,
      idToken,
      refreshToken,
      claims,
    });
    const tokenValidationErrors = await validate(tokenResult as object);

    if (tokenValidationErrors.length) {
      const supportEmail = await this.issuer.getSupportEmail(idpId);
      throw new OidcClientTokenResultFailedException(
        supportEmail,
        tokenValidationErrors.toString(),
      );
    }

    return tokenResult;
  }

  async getUserinfo({ accessToken, idpId }: UserInfosParams): Promise<any> {
    // OIDC: call idp's /userinfo endpoint
    const plainIdpIdentity = await this.utils.getUserInfo(accessToken, idpId);

    this.logger.info({
      code: `oidc-client-info:get-userinfo`,
      plainIdpIdentity,
    });

    return plainIdpIdentity;
  }

  async getEndSessionUrl(
    ipdId: string,
    stateFromSession: string,
    idTokenHint?: TokenSet | string,
    postLogoutRedirectUri?: string,
  ) {
    return await this.utils.getEndSessionUrl(
      ipdId,
      stateFromSession,
      idTokenHint,
      postLogoutRedirectUri,
    );
  }

  async hasEndSessionUrl(ipdId: string): Promise<boolean> {
    return await this.utils.hasEndSessionUrl(ipdId);
  }
}
