import { ConfigService } from "@fc/config";
import { UserSession } from "@fc/core";
import { LoggerService } from "@fc/logger";
import { getConfigMock } from "@mocks/config";
import { Test, TestingModule } from "@nestjs/testing";
import { OidcAcrService } from "./oidc-acr.service";
import { ExtendedInteraction } from "./oidc-acr.type";

describe("OidcAcrService", () => {
  let service: OidcAcrService;

  const configServiceMock = getConfigMock();
  const loggerServiceMock = { warn: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcAcrService, ConfigService, LoggerService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcAcrService>(OidcAcrService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    configServiceMock.get.mockReturnValue({
      supportedAcrValues: ["A", "B"],
      defaultIdpId: "defaultIdpId",
    });
  });

  describe("getInteractionAcr()", () => {
    it("should return undefined if essential ACR requirement is not satisfied", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "C",
        idpAcr: "B",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return the IdP ACR if essential ACR is satisfied", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "B C",
        idpAcr: "B",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("B");
    });

    it("should return 'eidas1' if IdP ACR is unsupported", () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        supportedAcrValues: ["A", "B"],
      });
      const sessionDataMock: UserSession = {
        spEssentialAcr: undefined,
        idpAcr: "C",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("eidas1");
    });
  });

  describe("getFilteredAcrValues()", () => {
    it("should return empty array with no requestedAcrValues provided", () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        supportedAcrValues: ["A", "B"],
      });

      // When
      const result = service["getFilteredAcrValues"](undefined);

      // Then
      expect(result).toEqual([]);
    });

    it("should filter supported ACR values when given a string", () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        supportedAcrValues: ["A", "B"],
      });

      const inputAcrValues = "A C";

      // When
      const result = service["getFilteredAcrValues"](inputAcrValues);

      // Then
      expect(result).toEqual(["A"]);
    });

    it("should filter supported ACR values when given an array", () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        supportedAcrValues: ["A", "B"],
      });

      const inputAcrValues = ["A", "C"];

      // When
      const result = service["getFilteredAcrValues"](inputAcrValues);

      // Then
      expect(result).toEqual(["A"]);
    });
  });

  describe("isEssentialAcrSatisfied()", () => {
    it("should return false when prompt contains essential_acr reason", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
        },
      } as unknown as ExtendedInteraction;

      // When
      const result = service["isEssentialAcrSatisfied"](interactionMock);

      // Then
      expect(result).toBe(false);
    });

    it("should return false when prompt contains essential_acrs reason", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "login",
          reasons: ["essential_acrs"],
        },
      } as unknown as ExtendedInteraction;

      // When
      const result = service["isEssentialAcrSatisfied"](interactionMock);

      // Then
      expect(result).toBe(false);
    });

    it("should return true when prompt does not contain essential ACR reasons", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "interaction-check",
          reasons: ["other_reasons"],
        },
      } as unknown as ExtendedInteraction;

      // When
      const result = service["isEssentialAcrSatisfied"](interactionMock);

      // Then
      expect(result).toBe(true);
    });
  });

  describe("getFilteredAcrParamsFromInteraction()", () => {
    it("should return acrClaims with essential single value", () => {
      // Given
      const interactionMock: ExtendedInteraction = {
        uid: "123",
        params: {},
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
          details: {
            acr: {
              essential: true,
              value: "A",
            },
          },
        },
      } as unknown as ExtendedInteraction;

      jest.spyOn(service, "getFilteredAcrValues").mockReturnValueOnce(["A"]);

      // When
      const result =
        service["getFilteredAcrParamsFromInteraction"](interactionMock);

      // Then
      expect(result).toEqual({
        acrClaims: {
          essential: true,
          value: "A",
        },
      });
    });

    it("should return acrClaims with essential multiple values", () => {
      // Given
      const interactionMock: ExtendedInteraction = {
        uid: "123",
        params: {},
        prompt: {
          name: "login",
          reasons: ["essential_acrs"],
          details: {
            acr: {
              essential: true,
              values: ["A", "B"],
            },
          },
        },
      } as unknown as ExtendedInteraction;

      jest.spyOn(service, "getFilteredAcrValues").mockReturnValueOnce(["A"]);

      // When
      const result =
        service["getFilteredAcrParamsFromInteraction"](interactionMock);

      // Then
      expect(result).toEqual({
        acrClaims: {
          essential: true,
          values: ["A"],
        },
      });
    });

    it("should return acrValues when acr_values parameter is used", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {
          acr_values: "A B",
          client_id: "",
          redirect_uri: "",
          state: "",
          idp_hint: "",
          login_hint: "",
        },
        prompt: {
          name: "consent",
          reasons: [],
          details: {},
        },
      } as unknown as ExtendedInteraction;

      jest.spyOn(service, "getFilteredAcrValues").mockReturnValueOnce(["A"]);

      // When
      const result =
        service["getFilteredAcrParamsFromInteraction"](interactionMock);

      // Then
      expect(result).toEqual({
        acrValues: "A",
      });
    });

    it("should return acrValues when none of the previous conditions are valid", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {
          client_id: "",
          redirect_uri: "",
          state: "",
          idp_hint: "",
          login_hint: "",
        },
        prompt: {
          name: "consent",
          reasons: [],
          details: {},
        },
      } as unknown as ExtendedInteraction;

      // When
      const result =
        service["getFilteredAcrParamsFromInteraction"](interactionMock);

      // Then
      expect(result).toEqual({ acrValues: "eidas1" });
    });

    it("should return nothing when none of the previous conditions are valid for defaultIdp", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {
          client_id: "",
          redirect_uri: "",
          state: "",
          idp_hint: "",
          login_hint: "",
        },
        prompt: {
          name: "consent",
          reasons: [],
          details: {},
        },
      } as unknown as ExtendedInteraction;

      // When
      const result = service["getFilteredAcrParamsFromInteraction"](
        interactionMock,
        "defaultIdpId",
      );

      // Then
      expect(result).toEqual({});
    });
  });
});
