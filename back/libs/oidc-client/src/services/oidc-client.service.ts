import { ValidatorOptions } from 'class-validator';
import { TokenSet } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { IOidcIdentity } from '@fc/oidc';
import { TrackedEventContextInterface } from '@fc/tracking';

import { MinIdentityDto, TokenResultDto } from '../dto';
import {
  OidcClientMissingIdentitySubException,
  OidcClientTokenResultFailedException,
  OidcClientUserinfosFailedException,
} from '../exceptions';
import {
  ExtraTokenParams,
  IdTokenClaimsWithRepScope,
  TokenParams,
  TokenResults,
  UserInfosParams,
} from '../interfaces';
import { OidcClientUtilsService } from './oidc-client-utils.service';

const DTO_OPTIONS: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

@Injectable()
export class OidcClientService {
  constructor(
    public readonly utils: OidcClientUtilsService,
    private readonly logger: LoggerService,
  ) {}

  async getTokenFromProvider(
    idpId: string,
    params: TokenParams,
    context: TrackedEventContextInterface,
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
      context,
      idpId,
      params,
      extraParams,
    );

    const {
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
    } = tokenSet;
    const {
      acr,
      amr = [],
      rep_scope: idpRepresentativeScope,
    }: IdTokenClaimsWithRepScope = tokenSet.claims();

    const tokenResult = {
      acr,
      amr,
      accessToken,
      idToken,
      refreshToken,
      idpRepresentativeScope,
    };

    const errorsOutputs = await validateDto(
      tokenResult,
      TokenResultDto,
      DTO_OPTIONS,
    );

    if (errorsOutputs.length) {
      this.logger.debug(errorsOutputs);
      throw new OidcClientTokenResultFailedException();
    }

    return tokenResult;
  }

  async getUserInfosFromProvider<T = IOidcIdentity>(
    { accessToken, idpId }: UserInfosParams,
    _context: TrackedEventContextInterface,
  ): Promise<T> {
    // OIDC: call idp's /userinfo endpoint
    let identity: T;
    try {
      identity = await this.utils.getUserInfo<T>(accessToken, idpId);
    } catch (error) {
      this.logger.debug(error.stack);
      throw new OidcClientUserinfosFailedException();
    }

    const errors = await validateDto(
      identity as object,
      MinIdentityDto,
      {
        whitelist: true,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    if (errors.length) {
      this.logger.debug(errors);
      throw new OidcClientMissingIdentitySubException();
    }

    return identity;
  }

  async getEndSessionUrlFromProvider(
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

  async hasEndSessionUrlFromProvider(ipdId: string): Promise<boolean> {
    return await this.utils.hasEndSessionUrl(ipdId);
  }
}
