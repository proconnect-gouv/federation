import { ConfigService } from "@fc/config";
import { RedisService } from "@fc/redis";
import { getConfigMock } from "@mocks/config";
import { Test, TestingModule } from "@nestjs/testing";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { RateLimiterKeyPrefix } from "../enum";
import { RateLimiterService } from "./rate-limiter.service";

jest.mock("rate-limiter-flexible", () => ({
  RateLimiterRedis: jest.fn().mockImplementation(() => ({
    consume: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("RateLimiterService", () => {
  let service: RateLimiterService;

  const configMock = getConfigMock();
  const redisMock = {
    client: {},
  };

  const keyPrefix = Object.values(
    RateLimiterKeyPrefix,
  )[0] as RateLimiterKeyPrefix;
  const rateLimiterParams = {
    keyPrefix,
    points: 5,
    duration: 60,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, RedisService, RateLimiterService],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(RedisService)
      .useValue(redisMock)
      .compile();

    service = module.get<RateLimiterService>(RateLimiterService);

    configMock.get.mockReturnValue({
      rateLimiterParams: [rateLimiterParams],
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should register rate limiter instances from config", () => {
      // When
      service.onModuleInit();

      // Then
      expect(RateLimiterRedis).toHaveBeenCalledTimes(1);
      expect(RateLimiterRedis).toHaveBeenCalledWith(
        expect.objectContaining({
          storeClient: redisMock.client,
          ...rateLimiterParams,
        }),
      );
    });
  });

  describe("consume", () => {
    it("should call consume on the matching rate limiter", async () => {
      // Given
      service.onModuleInit();
      const rateLimiterInstance = (RateLimiterRedis as jest.Mock).mock
        .results[0].value;

      // When
      await service.consume(keyPrefix, "user-key");

      // Then
      expect(rateLimiterInstance.consume).toHaveBeenCalledWith("user-key");
    });

    it("should throw if rate limiter is not registered", () => {
      // Then
      expect(() =>
        service.consume("UNKNOWN_PREFIX" as RateLimiterKeyPrefix, "user-key"),
      ).toThrow("Rate limiter not found for key prefix: UNKNOWN_PREFIX");
    });
  });

  describe("reset", () => {
    it("should call delete on the matching rate limiter", async () => {
      // Given
      service.onModuleInit();
      const rateLimiterInstance = (RateLimiterRedis as jest.Mock).mock
        .results[0].value;

      // When
      await service.reset(keyPrefix, "user-key");

      // Then
      expect(rateLimiterInstance.delete).toHaveBeenCalledWith("user-key");
    });
  });
});
