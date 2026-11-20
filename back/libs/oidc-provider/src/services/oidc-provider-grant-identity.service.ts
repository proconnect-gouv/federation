import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { LoggerService } from "#libs/logger";
import { RedisService } from "#libs/redis";
import {
  SessionAliasNotFoundException,
  SessionBadAliasException,
  SessionConfig,
  SessionNotFoundException,
  SessionService,
} from "#libs/session";
import type { CoreFcaSession } from "#src";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { OIDC_PROVIDER_REDIS_PREFIX } from "../adapters/oidc-provider-redis.adapter";
import { GrantIdentity } from "../dto";

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
    private readonly sessionService: SessionService,
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
   * @returns the identity of the grant, or undefined if it is missing or was
   * issued for another account.
   */
  async find(grantId: string, sub: string): Promise<GrantIdentity | undefined> {
    const cipher = await this.redis.client.get(this.keyFor(grantId));
    const grantIdentity = cipher
      ? await this.decrypt(cipher)
      : await this.getLegacy(sub);

    if (grantIdentity?.spIdentity?.sub !== sub) {
      return undefined;
    }

    return grantIdentity;
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

  /**
   * Grants issued before this deploy have no record: their identity is still
   * in the session that the `sub` alias points to.
   *
   * @todo remove once those grants have expired (Session lifetime), along with
   * SessionService.setAlias and SessionService.getAlias.
   */
  private async getLegacy(sub: string): Promise<GrantIdentity | undefined> {
    try {
      const sessionId = await this.sessionService.getAlias(sub);
      const { User } =
        await this.sessionService.getDataFromBackend<CoreFcaSession>(sessionId);

      return { spIdentity: User?.spIdentity, sessionId };
    } catch (error) {
      if (
        error instanceof SessionAliasNotFoundException ||
        error instanceof SessionBadAliasException ||
        error instanceof SessionNotFoundException
      ) {
        return undefined;
      }
      throw error;
    }
  }

  private keyFor(grantId: string): string {
    return `${OIDC_PROVIDER_REDIS_PREFIX}:grant-identity:${grantId}`;
  }
}
