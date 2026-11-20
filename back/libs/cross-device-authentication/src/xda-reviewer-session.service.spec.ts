import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { RedisService } from "#libs/redis";
import { getRedisServiceMock } from "#mocks/redis";
import { Test, TestingModule } from "@nestjs/testing";
import { XdaReviewerSessionService } from "./xda-reviewer-session.service";

describe(XdaReviewerSessionService.name, () => {
  let service: XdaReviewerSessionService;

  const configServiceMock = { get: jest.fn() };
  const redisMock = getRedisServiceMock();
  // reversible stand-in for the symmetric encryption
  const cryptographyMock = {
    encryptSymetric: jest.fn((key: string, data: string) => `${key}(${data})`),
    decryptSymetric: jest.fn((key: string, data: string) =>
      data.slice(key.length + 1, -1),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XdaReviewerSessionService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: RedisService, useValue: redisMock },
        { provide: CryptographyService, useValue: cryptographyMock },
      ],
    }).compile();

    service = module.get(XdaReviewerSessionService);
    jest.clearAllMocks();

    configServiceMock.get.mockReturnValue({ encryptionKey: "key" });
  });

  describe("save", () => {
    it("should store the encrypted session id under the request key, with the TTL", async () => {
      await service.save({
        requestId: "request-id",
        reviewerSessionId: "reviewer-session-id",
        ttlInMs: 60000,
      });

      expect(redisMock.client.set).toHaveBeenCalledWith(
        "XDA:reviewer:request-id",
        "key(reviewer-session-id)",
        "PX",
        60000,
      );
    });
  });

  describe("getAndDelete", () => {
    it("should return the session id and remove it", async () => {
      redisMock.client.getdel.mockResolvedValue("key(reviewer-session-id)");

      const result = await service.getAndDelete("request-id");

      expect(redisMock.client.getdel).toHaveBeenCalledWith(
        "XDA:reviewer:request-id",
      );
      expect(result).toBe("reviewer-session-id");
    });

    it("should return null when there is no session id for the request", async () => {
      redisMock.client.getdel.mockResolvedValue(null);

      const result = await service.getAndDelete("request-id");

      expect(result).toBeNull();
      expect(cryptographyMock.decryptSymetric).not.toHaveBeenCalled();
    });
  });
});
