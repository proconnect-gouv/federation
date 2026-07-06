import { ConfigService } from "@fc/config";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { RedisConfig } from "../dto";

@Injectable()
export class RedisService {
  public client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const config = this.config.get<RedisConfig>("Redis");

    this.client = new Redis(config);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
