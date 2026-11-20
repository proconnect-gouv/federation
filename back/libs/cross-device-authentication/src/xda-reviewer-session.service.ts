import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { RedisService } from "#libs/redis";
import { SessionConfig } from "#libs/session";
import { Injectable } from "@nestjs/common";

const XDA_REVIEWER_REDIS_PREFIX = "XDA:reviewer";

/**
 * Stores the session id of the reviewer who approved a request, until the
 * requester continues to the service provider or the request expires.
 */
@Injectable()
export class XdaReviewerSessionService {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly cryptography: CryptographyService,
  ) {}

  async save(params: {
    requestId: string;
    reviewerSessionId: string;
    ttlInMs: number;
  }): Promise<void> {
    const { encryptionKey } = this.config.get<SessionConfig>("Session");
    const cipher = this.cryptography.encryptSymetric(
      encryptionKey,
      params.reviewerSessionId,
    );

    await this.redis.client.set(
      this.keyFor(params.requestId),
      cipher,
      "PX",
      params.ttlInMs,
    );
  }

  /**
   * The session id can only be used once.
   */
  async getAndDelete(requestId: string): Promise<string | null> {
    const cipher = await this.redis.client.getdel(this.keyFor(requestId));
    if (!cipher) {
      return null;
    }

    const { encryptionKey } = this.config.get<SessionConfig>("Session");
    return this.cryptography.decryptSymetric(encryptionKey, cipher);
  }

  private keyFor(requestId: string): string {
    return `${XDA_REVIEWER_REDIS_PREFIX}:${requestId}`;
  }
}
