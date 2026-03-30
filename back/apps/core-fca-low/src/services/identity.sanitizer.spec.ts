import { CachedOrganizationService } from "@fc/cached-organization";
import { ConfigService } from "@fc/config";
import { IdentityProviderAdapterMongoService } from "@fc/identity-provider-adapter-mongo";
import { LoggerService } from "@fc/logger";
import { IdentityFromIdpDto } from "../dto/identity-from-idp.dto";
import { CoreFcaInvalidIdentityException } from "../exceptions";
import { IdentitySanitizer } from "./identity.sanitizer";

jest.mock("@fc/logger");
jest.mock("@fc/config");
jest.mock("@fc/identity-provider-adapter-mongo");
jest.mock("@fc/api-entreprise");
jest.mock("@fc/cached-organization");

describe("IdentitySanitizer", () => {
  let identitySanitizer: IdentitySanitizer;
  let logger = {
    error: jest.fn(),
  } as unknown as LoggerService;
  let identityProvider: IdentityProviderAdapterMongoService;
  let config: ConfigService;
  let cachedOrganizationService: CachedOrganizationService;

  beforeEach(() => {
    identityProvider = new IdentityProviderAdapterMongoService(
      null,
      null,
      null,
      logger,
      null,
    );
    cachedOrganizationService = new CachedOrganizationService(null, null, null);
    cachedOrganizationService.computeRoles = jest.fn();
    cachedOrganizationService.getCachedOrganizationBySiret = jest.fn();
    config = new ConfigService({ config: {}, schema: {} } as any);
    config.get = jest
      .fn()
      .mockReturnValue({ supportEmail: "pc-support@test.com" });
    identitySanitizer = new IdentitySanitizer(
      logger,
      identityProvider,
      config,
      cachedOrganizationService,
    );
  });

  describe("getValidatedIdentityFromIdp", () => {
    beforeEach(() => {
      jest
        .spyOn(identityProvider, "getById")
        .mockResolvedValue({ supportEmail: "support@test.com" } as any);
    });

    it("should return validated identity when valid data is provided", async () => {
      const validIdentity = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
      };
      const idpId = "idp1";

      const result = await identitySanitizer.getValidatedIdentityFromIdp(
        validIdentity,
        idpId,
      );
      expect(result).toEqual(expect.objectContaining(validIdentity));
    });

    it("should throw CoreFcaInvalidIdentityException when validation fails", async () => {
      const invalidIdentity = {
        sub: "",
        email: "invalid",
        given_name: "",
        usual_name: "",
        uid: "",
      };
      const idpId = "idp1";

      await expect(
        identitySanitizer.getValidatedIdentityFromIdp(invalidIdentity, idpId),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it("should not throw CoreFcaInvalidIdentityException when phone number is an empty string", async () => {
      const invalidIdentity = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        phone_number: "",
      };
      const idpId = "idp1";

      const result = await identitySanitizer.getValidatedIdentityFromIdp(
        invalidIdentity,
        idpId,
      );

      expect(result.phone_number).toEqual("");
    });

    it("should not throw CoreFcaInvalidIdentityException when phone number is an array", async () => {
      const invalidIdentity = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        phone_number: ["0123456789", "0123456789"],
      };
      const idpId = "idp1";

      const result = await identitySanitizer.getValidatedIdentityFromIdp(
        invalidIdentity,
        idpId,
      );

      expect(result.phone_number).toEqual(["0123456789", "0123456789"]);
    });
  });

  describe("transformIdentity", () => {
    beforeEach(() => {
      jest
        .spyOn(identityProvider, "getById")
        .mockResolvedValue({ siret: "12345678900007" } as any);
    });

    it("should transform identity and return IdentityForSpDto object", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        aud: "aud123",
        email: "test@test.com",
        extra: "extra",
        given_name: "John",
        sub: "123",
        uid: "UID123",
        usual_name: "Doe",
      };

      const result = await identitySanitizer.transformIdentity(
        identityFromIdp as IdentityFromIdpDto,
        idpId,
        sub,
        acr,
      );

      expect(result).toEqual({
        custom: { extra: "extra" },
        email: "test@test.com",
        given_name: "John",
        idp_acr: acr,
        idp_id: idpId,
        siret: "12345678900007",
        sub,
        uid: "UID123",
        usual_name: "Doe",
      });
    });

    it("should fetch and compute roles when featureFetchOrganizationData is true and siret is present", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        siret: "12345678900007",
      };

      config.get = jest.fn().mockReturnValue({
        featureFetchOrganizationData: true,
      });

      (cachedOrganizationService.computeRoles as jest.Mock).mockReturnValue([
        "agent_public",
      ]);

      const identityForSp = await identitySanitizer.transformIdentity(
        identityFromIdp as IdentityFromIdpDto,
        idpId,
        sub,
        acr,
      );

      expect(
        cachedOrganizationService.getCachedOrganizationBySiret,
      ).toHaveBeenCalledWith("12345678900007");
      expect(identityForSp.roles).toEqual(["agent_public"]);
      expect(identityForSp.is_service_public).toBe(true);
    });

    it("should handle error when getCachedOrganizationBySiret throws", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        siret: "12345678900007",
      };

      config.get = jest.fn().mockReturnValue({
        featureFetchOrganizationData: true,
      });

      const error = new Error("Organization fetch failed");
      (
        cachedOrganizationService.getCachedOrganizationBySiret as jest.Mock
      ).mockRejectedValue(error);

      const result = await identitySanitizer.transformIdentity(
        identityFromIdp as IdentityFromIdpDto,
        idpId,
        sub,
        acr,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "identity-sanitizer-cached-organization-error",
        }),
      );
      expect(result.roles).toBeUndefined();
      expect(result.is_service_public).toBeUndefined();
    });

    it("should not throw CoreFcaInvalidIdentityException when phone number is invalid", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        phone_number: "",
      };

      const result = await identitySanitizer.transformIdentity(
        identityFromIdp as IdentityFromIdpDto,
        idpId,
        sub,
        acr,
      );

      expect(result.phone_number).toBeUndefined();
    });

    it("should not throw CoreFcaInvalidIdentityException when phone number is an array", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
        phone_number: ["0123456789", "0123456789"],
      };

      const result = await identitySanitizer.transformIdentity(
        identityFromIdp as IdentityFromIdpDto,
        idpId,
        sub,
        acr,
      );

      expect(result.phone_number).toBeUndefined();
    });

    it("should throw CoreFcaInvalidIdentityException when siret is missing and no default is provided", async () => {
      const idpId = "idp1";
      const sub = "sub123";
      const acr = "acr1";
      const identityFromIdp = {
        sub: "123",
        email: "test@test.com",
        given_name: "John",
        usual_name: "Doe",
        uid: "UID123",
      };

      jest
        .spyOn(identityProvider, "getById")
        .mockResolvedValue({ siret: null } as any);

      await expect(
        identitySanitizer.transformIdentity(
          identityFromIdp as IdentityFromIdpDto,
          idpId,
          sub,
          acr,
        ),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });
  });
});
