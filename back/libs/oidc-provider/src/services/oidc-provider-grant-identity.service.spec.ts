import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { LoggerService } from "#libs/logger";
import { RedisService } from "#libs/redis";
import { getLoggerMock } from "#mocks/logger";
import { getRedisServiceMock } from "#mocks/redis";
import { Test, TestingModule } from "@nestjs/testing";
import { GrantIdentity } from "../dto";
import { OidcCtx } from "../interfaces";
import { OidcProviderGrantIdentityService } from "./oidc-provider-grant-identity.service";

describe("OidcProviderGrantIdentityService", () => {
  let service: OidcProviderGrantIdentityService;

  const configServiceMock = { get: jest.fn() };
  const redisMock = getRedisServiceMock();
  const loggerMock = getLoggerMock();
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

  describe("findFromToken", () => {
    it("should return the identity stored for the grant of the token", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify(grantIdentity)})`,
      );

      // When
      const result = await service.findFromToken({ grantId: "grant-id" });

      // Then
      expect(redisMock.client.get).toHaveBeenCalledWith(
        "OIDC-P:grant-identity:grant-id",
      );
      expect(result).toEqual(grantIdentity);
    });

    it("should return undefined when the token has no grant", async () => {
      // When
      const result = await service.findFromToken({});

      // Then
      expect(redisMock.client.get).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return undefined without token", async () => {
      // When
      const result = await service.findFromToken(undefined);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return undefined when the grant has no record", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(null);

      // When
      const result = await service.findFromToken({ grantId: "grant-id" });

      // Then
      expect(result).toBeUndefined();
    });

    it("should return undefined and log when the stored identity is invalid", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify({ spIdentity: grantIdentity.spIdentity })})`,
      );

      // When
      const result = await service.findFromToken({ grantId: "grant-id" });

      // Then
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalled();
    });
  });

  describe("findFromLoadedGrant", () => {
    it("should return the identity stored for the grant loaded by oidc-provider", async () => {
      // Given
      redisMock.client.get.mockResolvedValueOnce(
        `key(${JSON.stringify(grantIdentity)})`,
      );
      const ctx = { oidc: { entities: { Grant: { jti: "grant-id" } } } };

      // When
      const result = await service.findFromLoadedGrant(ctx as OidcCtx);

      // Then
      expect(redisMock.client.get).toHaveBeenCalledWith(
        "OIDC-P:grant-identity:grant-id",
      );
      expect(result).toEqual(grantIdentity);
    });

    it("should return undefined when no grant is loaded", async () => {
      // When
      const result = await service.findFromLoadedGrant({
        oidc: { entities: {} },
      } as OidcCtx);

      // Then
      expect(redisMock.client.get).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
