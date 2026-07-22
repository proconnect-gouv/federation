import { ConfigService } from "@fc/config";
import { RedisService } from "@fc/redis";
import { RateLimiterRedis } from "rate-limiter-flexible";

import { Injectable } from "@nestjs/common";
import { RateLimiterConfig, RateLimiterParams } from "../dto";
import { RateLimiterKeyPrefix } from "../enum";

@Injectable()
export class RateLimiterService {
  private rateLimiters: Map<RateLimiterKeyPrefix, RateLimiterRedis> = new Map();

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const { rateLimiterParams } =
      this.config.get<RateLimiterConfig>("RateLimiter");
    rateLimiterParams.forEach((config) => {
      this.register(config);
    });
  }

  private register(rateLimiterParams: RateLimiterParams) {
    const rateLimiter = new RateLimiterRedis({
      storeClient: this.redis.client,
      ...rateLimiterParams,
    });
    this.rateLimiters.set(rateLimiterParams.keyPrefix, rateLimiter);
  }

  private getRateLimiter(keyPrefix: RateLimiterKeyPrefix): RateLimiterRedis {
    const rateLimiter = this.rateLimiters.get(keyPrefix);
    if (!rateLimiter) {
      throw new Error(`Rate limiter not found for key prefix: ${keyPrefix}`);
    }
    return rateLimiter;
  }

  consume(keyPrefix: RateLimiterKeyPrefix, key: string) {
    const rateLimiter = this.getRateLimiter(keyPrefix);
    return rateLimiter.consume(key);
  }

  reset(keyPrefix: RateLimiterKeyPrefix, key: string) {
    const rateLimiter = this.getRateLimiter(keyPrefix);
    return rateLimiter.delete(key);
  }
}
