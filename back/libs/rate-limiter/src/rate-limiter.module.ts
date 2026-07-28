import { RedisModule } from "@fc/redis";
import { Module } from "@nestjs/common";
import { RateLimiterService } from "./services";

@Module({
  imports: [RedisModule],
  providers: [RateLimiterService],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}
