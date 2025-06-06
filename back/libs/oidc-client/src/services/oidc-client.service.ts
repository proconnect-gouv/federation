import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IdTokenClaims, TokenSet } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

import { TokenResultDto } from '../dto';
import {
  OidcClientTokenResultFailedException,
  OidcClientUserinfosFailedException,
} from '../exceptions';
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
    /**
     * @todo #434 refacto sur getTokenSet,
     * - ne pas renvoyer tokenSet mais directement tokenResult
     * - inclure le DTO à la fin de getTokenSet (seul vérification de l'acces_token)
     * - simplifier les appels de getTokenSet en (idp, les code de transfert(state, nonce), le context pour tracking)
     * - voir commit original : 440d0a1734e0e1206b7e21781cbb0f186a93dd82
     */
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
    const { acr, amr = [] }: IdTokenClaims = tokenSet.claims();

    const tokenResult = plainToInstance(TokenResultDto, {
      acr,
      amr,
      accessToken,
      idToken,
      refreshToken,
    });
    const tokenValidationErrors = await validate(tokenResult as object);

    if (tokenValidationErrors.length) {
      this.logger.info({ tokenValidationErrors });
      throw new OidcClientTokenResultFailedException();
    }

    return tokenResult;
  }

  async getUserinfo({ accessToken, idpId }: UserInfosParams): Promise<any> {
    // OIDC: call idp's /userinfo endpoint
    try {
      return await this.utils.getUserInfo(accessToken, idpId);
    } catch (error) {
      this.logger.debug(error.stack);
      throw new OidcClientUserinfosFailedException();
    }
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
