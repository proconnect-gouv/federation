import { AxiosResponse } from 'axios';
import { ValidatorOptions } from 'class-validator';
import { JSONWebKeySet, JWTPayload } from 'jose';
import { lastValueFrom } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { Use } from '@fc/cryptography';
import {
  DataProviderAdapterMongoService,
  DataProviderMetadata,
} from '@fc/data-provider-adapter-mongo';
import { JwtService } from '@fc/jwt';
import { LoggerService } from '@fc/logger-legacy';
import { atHashFromAccessToken } from '@fc/oidc';
import {
  OIDC_PROVIDER_REDIS_PREFIX,
  OidcProviderConfig,
} from '@fc/oidc-provider';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { SessionService } from '@fc/session';

import { ChecktokenRequestDto } from '../dto';
import {
  CoreFcpFetchAccessTokenFromRedisFailed,
  CoreFcpFetchDataProviderJwksFailed,
  CoreFcpInvalidAccessTokenFromDataProvider,
  InvalidChecktokenRequestException,
} from '../exceptions';

@Injectable()
export class DataProviderService {
  // OidcProviderRedisAdapter
  // Rule override allowed for dependency injection
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly dataProvider: DataProviderAdapterMongoService,
    private readonly http: HttpService,
    private readonly jwt: JwtService,
    @Inject(REDIS_CONNECTION_TOKEN) private readonly redis: Redis,
    private readonly session: SessionService,
  ) {}
  /**
   * This function take the checkTokenRequest to validate it
   * @param checktokenRequest checktoken of the request
   * @returns nothing
   * @throws InvalidChecktokenRequestException if the request body doesn't respect the DTO
   */
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
    payload: JWTPayload,
    dataProviderId: string,
  ): Promise<string> {
    const dataProvider = await this.dataProvider.getByClientId(dataProviderId);

    const jws = await this.generateJws(payload, dataProvider);
    const jwe = await this.generateJwe(jws, dataProvider);

    return jwe;
  }

  async getSessionByAccessToken(accessToken: string): Promise<string> {
    const atHash = atHashFromAccessToken({ jti: accessToken });

    return await this.session.getAlias(atHash);
  }

  /**
   * @Note ⚠️ This function use the adapter prefix that we pass to oidc-provider.
   * the "AccessToken" part is fully handled by oidc-provider so if you always get
   * nothing with this function, you should check the oidc-provider documentation
   * and look for some changes. ⚠️
   */
  async getAccessTokenExp(accessToken: string): Promise<number> {
    const accessTokenKey = `${OIDC_PROVIDER_REDIS_PREFIX}:AccessToken:${accessToken}`;

    let ttl;

    /**
     * @author sherman
     * @todo It would be better if we used the oidc provider redis adapter instead of
     * directly using the redis client. That or any other wrapper via DI.
     */
    try {
      ttl = await this.redis.ttl(accessTokenKey);
    } catch (error) {
      throw new CoreFcpFetchAccessTokenFromRedisFailed(error);
    }

    if (ttl <= 0) {
      throw new CoreFcpInvalidAccessTokenFromDataProvider(ttl);
    }

    /**
     * Using floor to avoid amplifying rounding TTL errors between the time we get the TTL
     * and the time we use it to generate the JWT.
     */
    const now = Math.floor(Date.now() / 1000);

    return now + ttl;
  }

  private async generateJws(
    payload: JWTPayload,
    dataProvider: DataProviderMetadata,
  ): Promise<string> {
    const { checktoken_endpoint_auth_signing_alg: signAlgorithm } =
      dataProvider;

    const {
      issuer,
      configuration: { jwks: signJwks },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    const signKey = this.jwt.getFirstRelevantKey(
      signJwks as JSONWebKeySet, // Types are incompatible for now, @todo see if we can fix this without side effect
      signAlgorithm,
      Use.SIG,
    );
    const jws = await this.jwt.sign(payload, issuer, signKey);

    return jws;
  }

  private async generateJwe(
    jwt: string,
    dataProvider: DataProviderMetadata,
  ): Promise<string> {
    const {
      jwks_uri: dataProviderJwksUrl,
      checktoken_encrypted_response_alg: encryptAlgorithm,
      checktoken_encrypted_response_enc: encryptEncoding,
    } = dataProvider;

    const encryptJwks = await this.fetchEncryptionKeys(dataProviderJwksUrl);

    const encryptKey = this.jwt.getFirstRelevantKey(
      encryptJwks,
      encryptAlgorithm,
      Use.ENC,
    );

    const jwe = await this.jwt.encrypt(jwt, encryptKey, encryptEncoding);

    return jwe;
  }

  private async fetchEncryptionKeys(url: string): Promise<JSONWebKeySet> {
    let response: AxiosResponse<JSONWebKeySet>;

    try {
      response = await lastValueFrom(this.http.get(url));
    } catch (error) {
      throw new CoreFcpFetchDataProviderJwksFailed(error);
    }

    this.logger.trace({ response });

    return response.data as JSONWebKeySet;
  }
}
