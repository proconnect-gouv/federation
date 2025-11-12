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
import { OidcClientUtilsService } from './oidc-client-utils.service';

@Injectable()
export class OidcClientService {
  constructor(
    public readonly utils: OidcClientUtilsService,
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
    const { acr, amr }: IdTokenClaims = tokenSet.claims();

    const tokenResult = plainToInstance(TokenResultDto, {
      acr,
      amr,
      accessToken,
      idToken,
      refreshToken,
    });
    const tokenValidationErrors = await validate(tokenResult as object);

    if (tokenValidationErrors.length) {
      this.logger.error({
        msg: 'token validation error',
        validationErrors: tokenValidationErrors,
      });
      throw new OidcClientTokenResultFailedException();
    }

    return tokenResult;
  }

  async getUserinfo({ accessToken, idpId }: UserInfosParams): Promise<any> {
    // OIDC: call idp's /userinfo endpoint
    return await this.utils.getUserInfo(accessToken, idpId);
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
