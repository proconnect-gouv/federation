import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { LoggerService } from "#libs/logger";
import { RedisService } from "#libs/redis";
import { SessionConfig } from "#libs/session";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { OIDC_PROVIDER_REDIS_PREFIX } from "../adapters/oidc-provider-redis.adapter";
import { GrantIdentity } from "../dto";
import { OidcCtx } from "../interfaces";

/**
 * Stores the identity handed over by a login, per grant.
 *
 * A grant is created at the end of each interaction (see
 * OidcProviderService.finishInteraction), so /token and /userinfo read the
 * identity of the login that issued the token, whatever happened to the
 * federation session since.
 */
@Injectable()
export class OidcProviderGrantIdentityService {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly cryptography: CryptographyService,
    private readonly logger: LoggerService,
  ) {}

  async save(
    grantId: string,
    grantIdentity: GrantIdentity,
    ttlInSeconds: number,
  ): Promise<void> {
    const { encryptionKey } = this.config.get<SessionConfig>("Session");
    const cipher = this.cryptography.encryptSymetric(
      encryptionKey,
      JSON.stringify(grantIdentity),
    );

    await this.redis.client.set(
      this.keyFor(grantId),
      cipher,
      "EX",
      ttlInSeconds,
    );
  }

  /**
   * For findAccount, at /token and /userinfo.
   */
  async findFromToken(
    token: { grantId?: string } | undefined,
  ): Promise<GrantIdentity | undefined> {
    return token?.grantId ? await this.find(token.grantId) : undefined;
  }

  /**
   * For our /token and /userinfo middlewares, once oidc-provider has loaded
   * the grant of the token.
   */
  async findFromLoadedGrant(ctx: OidcCtx): Promise<GrantIdentity | undefined> {
    const grantId = ctx.oidc?.entities?.Grant?.jti;
    return grantId ? await this.find(grantId) : undefined;
  }

  private async find(grantId: string): Promise<GrantIdentity | undefined> {
    const cipher = await this.redis.client.get(this.keyFor(grantId));
    return cipher ? await this.decrypt(cipher) : undefined;
  }

  private async decrypt(cipher: string): Promise<GrantIdentity | undefined> {
    const { encryptionKey } = this.config.get<SessionConfig>("Session");
    const grantIdentity = plainToInstance(
      GrantIdentity,
      JSON.parse(this.cryptography.decryptSymetric(encryptionKey, cipher)),
    );

    const errors = await validate(grantIdentity);
    if (errors.length > 0) {
      this.logger.error({
        msg: "OidcProviderGrantIdentityService:decrypt() Invalid grant identity from Redis.",
        validationErrors: errors,
      });
      return undefined;
    }

    return grantIdentity;
  }

  private keyFor(grantId: string): string {
    return `${OIDC_PROVIDER_REDIS_PREFIX}:grant-identity:${grantId}`;
  }
}
