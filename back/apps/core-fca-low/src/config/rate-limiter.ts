import type { RateLimiterConfig } from "#libs/rate-limiter";
import { RateLimiterKeyPrefix } from "#libs/rate-limiter";

const rateLimiterConfig: RateLimiterConfig = {
  rateLimiterParams: [
    {
      keyPrefix: RateLimiterKeyPrefix.VERIFY_EMAIL_TOKEN,
      points: 10, // 10 requests
      duration: 5 * 60, // per 5 minutes per email address
    },
  ],
};

export default rateLimiterConfig;
