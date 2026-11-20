import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { LoggerService } from "#libs/logger";
import { RedisService } from "#libs/redis";
import {
  SessionAliasNotFoundException,
  SessionNotFoundException,
  SessionService,
  SessionStorageException,
} from "#libs/session";
import { getLoggerMock } from "#mocks/logger";
import { getRedisServiceMock } from "#mocks/redis";
import { getSessionServiceMock } from "#mocks/session";
import { Test, TestingModule } from "@nestjs/testing";
import { GrantIdentity } from "../dto";
import { OidcProviderGrantIdentityService } from "./oidc-provider-grant-identity.service";

describe("OidcProviderGrantIdentityService", () => {
  let service: OidcProviderGrantIdentityService;

  const configServiceMock = { get: jest.fn() };
  const redisMock = getRedisServiceMock();
  const loggerMock = getLoggerMock();
  const sessionServiceMock = getSessionServiceMock();
  // reversible stand-in for the symmetric encryption
  const cryptographyMock = {
    encryptSymetric: jest.fn((key: string, data: string) => `${key}(${data})`),
    decryptSymetric: jest.fn((key: string, data: string) =>
      data.slice(key.length + 1, -1),
    ),
  };

  const grantIdentity = {
    spIdentity: { sub: "test-sub", email: "jean@example.gouv.fr" },
    sessionId: "session-id",
  } as GrantIdentity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderGrantIdentityService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: RedisService, useValue: redisMock },
        { provide: CryptographyService, useValue: cryptographyMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compile();

    service = module.get(OidcProviderGrantIdentityService);
    jest.clearAllMocks();

    configServiceMock.get.mockReturnValue({ encryptionKey: "key" });
  });

  describe("save", () => {
    it("should store the encrypted identity under a grant key, with the TTL", async () => {
      // When
      await service.save("grant-id", grantIdentity, 43200);

      // Then
      expect(redisMock.client.set).toHaveBeenCalledWith(
        "OIDC-P:grant-identity:grant-id",
        `key(${JSON.stringify(grantIdentity)})`,
        "EX",
        43200,
      );
    });
  });

  describe("find", () => {
    it("should return the identity stored for the grant", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify(grantIdentity)})`,
      );

      // When
      const result = await service.find("grant-id", "test-sub");

      // Then
      expect(redisMock.client.get).toHaveBeenCalledWith(
        "OIDC-P:grant-identity:grant-id",
      );
      expect(result).toEqual(grantIdentity);
      expect(sessionServiceMock.getAlias).not.toHaveBeenCalled();
    });

    it("should return undefined when the identity belongs to another sub", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify(grantIdentity)})`,
      );

      // When
      const result = await service.find("grant-id", "other-sub");

      // Then
      expect(result).toBeUndefined();
    });

    it("should return undefined and log when the stored identity is invalid", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify({ spIdentity: grantIdentity.spIdentity })})`,
      );

      // When
      const result = await service.find("grant-id", "test-sub");

      // Then
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalled();
    });

    describe("for grants issued before this release, without record", () => {
      beforeEach(() => {
        redisMock.client.get.mockResolvedValueOnce(null);
      });

      it("should fall back to the session of the sub alias", async () => {
        // Given
        sessionServiceMock.getAlias.mockResolvedValueOnce("session-id");
        sessionServiceMock.getDataFromBackend.mockResolvedValueOnce({
          User: { spIdentity: grantIdentity.spIdentity },
        });

        // When
        const result = await service.find("grant-id", "test-sub");

        // Then
        expect(sessionServiceMock.getAlias).toHaveBeenCalledWith("test-sub");
        expect(sessionServiceMock.getDataFromBackend).toHaveBeenCalledWith(
          "session-id",
        );
        expect(sessionServiceMock.initCache).not.toHaveBeenCalled();
        expect(result).toEqual(grantIdentity);
      });

      it("should return undefined without alias", async () => {
        // Given
        sessionServiceMock.getAlias.mockRejectedValueOnce(
          new SessionAliasNotFoundException(),
        );

        // When
        const result = await service.find("grant-id", "test-sub");

        // Then
        expect(result).toBeUndefined();
      });

      it("should return undefined when the aliased session has expired", async () => {
        // Given
        sessionServiceMock.getAlias.mockResolvedValueOnce("session-id");
        sessionServiceMock.getDataFromBackend.mockRejectedValueOnce(
          new SessionNotFoundException(),
        );

        // When
        const result = await service.find("grant-id", "test-sub");

        // Then
        expect(result).toBeUndefined();
      });

      it("should throw on storage errors", async () => {
        // Given
        sessionServiceMock.getAlias.mockResolvedValueOnce("session-id");
        sessionServiceMock.getDataFromBackend.mockRejectedValueOnce(
          new SessionStorageException(),
        );

        // When / Then
        await expect(service.find("grant-id", "test-sub")).rejects.toThrow(
          SessionStorageException,
        );
      });
    });
  });
});
