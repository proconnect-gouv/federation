import { ValidatorOptions } from 'class-validator';
import { JSONWebKeySet } from 'jose';

import { Injectable } from '@nestjs/common';

import { AccountFcaService } from '@fc/account-fca';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import {
  ChecktokenRequestDto,
  DpJwtPayloadInterface,
  InvalidChecktokenRequestException,
  TokenIntrospectionInterface,
} from '@fc/core';
import { CoreFcaSession } from '@fc/core-fca';
import { Use } from '@fc/cryptography';
import { DataProviderMetadata } from '@fc/data-provider-adapter-mongo';
import { JwtService } from '@fc/jwt';
import { AccessToken, atHashFromAccessToken, stringToArray } from '@fc/oidc';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { OidcProviderRedisAdapter } from '@fc/oidc-provider/adapters';
import { RedisService } from '@fc/redis';
import { SessionService } from '@fc/session';

@Injectable()
export class DataProviderService {
  // Rule override allowed for dependency injection
  // eslint-disable-next-line max-params
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly session: SessionService,
    private readonly accountService: AccountFcaService,
  ) {}

  async checkRequestValid(
    checktokenRequest: ChecktokenRequestDto,
  ): Promise<void> {
    const validatorOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    };

    const errors = await validateDto(
      checktokenRequest,
      ChecktokenRequestDto,
      validatorOptions,
    );
    if (errors.length > 0) {
      throw new InvalidChecktokenRequestException();
    }
  }

  async generateJwt(
    tokenIntrospection: TokenIntrospectionInterface,
    dataProvider: DataProviderMetadata,
  ): Promise<string> {
    const payload: DpJwtPayloadInterface = {
      token_introspection: tokenIntrospection,
    };

    const jws = await this.generateJws(payload, dataProvider);
    const jwe = await this.generateJwe(jws, dataProvider);

    return jwe;
  }

  async getSessionByAccessToken(
    accessToken: string,
  ): Promise<CoreFcaSession | null> {
    const atHash = atHashFromAccessToken({ jti: accessToken });
    const sessionId = await this.session.getAlias(atHash);

    if (!sessionId) {
      return null;
    }

    return await this.session.getDataFromBackend<CoreFcaSession>(sessionId);
  }

  async generateTokenIntrospection(
    session: CoreFcaSession,
    accessToken: string,
    dataProvider: DataProviderMetadata,
  ): Promise<TokenIntrospectionInterface> {
    /**
     * We can not use DI for this adapter since it was made to be instantiated by `oidc-provider`
     * It requires a ServiceProviderAdapter that we won't use here
     * and the `context` parameter which is a string, not a provider.
     */
    const adapter = new OidcProviderRedisAdapter(
      this.redis,
      undefined,
      'AccessToken',
    );

    const { expire, payload: interaction } =
      await adapter.getExpireAndPayload<AccessToken>(accessToken);

    if (expire <= 0 || !session) {
      return this.generateExpiredResponse();
    }

    return await this.generateValidResponse(dataProvider, session, interaction);
  }

  generateExpiredResponse(): TokenIntrospectionInterface {
    return { active: false };
  }

  private async generateValidResponse(
    dataProvider: DataProviderMetadata,
    session: CoreFcaSession,
    accessToken: AccessToken,
  ): Promise<TokenIntrospectionInterface> {
    const { iat, exp, jti, clientId } = accessToken;

    const {
      User: { idpIdentity, idpId, interactionAcr },
    } = session;

    const dpSub = await this.generateDataProviderSub(idpIdentity, idpId);
    // Limit scopes returned to prevent data provider from learning more about the network than necessary.
    // @see https://www.rfc-editor.org/rfc/rfc7662.html#section-2.2
    const authorizedScopes = this.filterScopes(
      dataProvider.scopes,
      accessToken.scope,
    );

    return {
      active: true,
      aud: clientId,
      sub: dpSub,
      iat,
      exp,
      acr: interactionAcr,
      jti,
      scope: authorizedScopes.join(' '),
    };
  }

  private filterScopes(
    dataProviderScopes: string[],
    interactionScope: string,
  ): string[] {
    return stringToArray(interactionScope).filter((requestedScope: string) =>
      dataProviderScopes.includes(requestedScope),
    );
  }

  // TODO: discuss with @gaetan whether it's the appropriate way of getting the sub
  private async generateDataProviderSub(
    idpIdentity,
    idpId,
  ): Promise<string | undefined> {
    const existingAccount = await this.accountService.getAccountByIdpAgentKeys({
      idpUid: idpId,
      idpSub: idpIdentity.sub,
    });
    return existingAccount?.sub;
  }

  private async generateJws(
    payload: DpJwtPayloadInterface,
    dataProvider: DataProviderMetadata,
  ): Promise<string> {
    const { checktoken_signed_response_alg: signingAlgorithm } = dataProvider;

    const { issuer, configuration } =
      this.config.get<OidcProviderConfig>('OidcProvider');

    const signingKey = this.jwt.getFirstRelevantKey(
      configuration.jwks as JSONWebKeySet, // Types are incompatible for now, @todo see if we can fix this without side effect
      signingAlgorithm,
      Use.SIG,
    );
    const jws = await this.jwt.sign(
      payload,
      issuer,
      dataProvider.client_id,
      signingKey,
    );

    return jws;
  }

  private async generateJwe(
    jwt: string,
    dataProvider: DataProviderMetadata,
  ): Promise<string> {
    const {
      checktoken_encrypted_response_alg: encryptionAlgorithm,
      checktoken_encrypted_response_enc: encryptionEncoding,
    } = dataProvider;

    const jwks = await this.jwt.fetchJwks(dataProvider.jwks_uri);

    const encryptionKey = this.jwt.getFirstRelevantKey(
      jwks,
      encryptionAlgorithm,
      Use.ENC,
    );

    const jwe = await this.jwt.encrypt(jwt, encryptionKey, encryptionEncoding);

    return jwe;
  }
}
