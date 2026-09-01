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
      supportedAcrValues: [
        "eidas0",
        "eidas1",
        "eidas2",
        "eidas3",
        "eidas0-mfa",
        "eidas1-mfa",
      ],
      acrValuesThatRequireNewSession: ["eidas2", "eidas3"],
      defaultIdpId: "defaultIdpId",
    });
  });

  describe("getInteractionAcr()", () => {
    it("should return undefined if essential ACR requirement is not satisfied", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "eidas1",
        idpAcr: "eidas0",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return the IdP ACR if essential ACR is satisfied", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "eidas0 eidas1",
        idpAcr: "eidas0",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("eidas0");
    });

    it("should return 'eidas1' if IdP ACR is unsupported", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: undefined,
        idpAcr: "unknown",
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("eidas1");
    });

    it("should return 'eidas1-mfa' if essential ACR is 'eidas1-mfa' and ACR is unsupported and email is verified by PCF", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "eidas1-mfa",
        idpAcr: "unknown",
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("eidas1-mfa");
    });

    it("should return 'eidas0-mfa' if essential ACR is 'eidas0-mfa' and email is verified by PCF", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "eidas0-mfa",
        idpAcr: "eidas0",
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBe("eidas0-mfa");
    });

    it("should return undefined if essential ACR is 'eidas2' and email is verified by PCF", () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: "eidas2",
        idpAcr: "eidas1",
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAcr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe("getInteractionAmr()", () => {
    it("should return undefined if idpAmr is undefined", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: undefined,
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return undefined if idpAmr is an empty array", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: [],
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return undefined if idpAmr is not an array", () => {
      // Given
      const sessionDataMock = {
        idpAmr: "pwd",
        isEmailVerifiedByPcf: true,
      } as unknown as UserSession;

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it("should return idpAmr enriched with 'mail' if email is verified by PCF", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: ["pwd"],
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toEqual(["pwd", "mail"]);
    });

    it("should not mutate the original idpAmr when adding 'mail'", () => {
      // Given
      const idpAmr = ["pwd"];
      const sessionDataMock: UserSession = {
        idpAmr,
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(idpAmr).toEqual(["pwd"]);
      expect(result).not.toBe(idpAmr);
    });

    it("should return idpAmr unchanged if email is verified by PCF but 'mail' is already present", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: ["pwd", "mail"],
        isEmailVerifiedByPcf: true,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toEqual(["pwd", "mail"]);
    });

    it("should return idpAmr unchanged if email is not verified by PCF", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: ["pwd"],
        isEmailVerifiedByPcf: false,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toEqual(["pwd"]);
    });

    it("should return idpAmr unchanged if isEmailVerifiedByPcf is undefined", () => {
      // Given
      const sessionDataMock: UserSession = {
        idpAmr: ["pwd"],
        isEmailVerifiedByPcf: undefined,
      };

      // When
      const result = service["getInteractionAmr"](sessionDataMock);

      // Then
      expect(result).toEqual(["pwd"]);
    });
  });

  describe("computeCanAcrBeSatisfiedByPcf", () => {
    it("should return true when all conditions are met", () => {
      configServiceMock.get.mockReturnValue({
        eligibleEmailsPercentage: 100,
      });

      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "openid eidas1-mfa",
        idpAmr: ["pwd"],
        isOtpEmailEnabled: true,
      });

      expect(result).toBe(true);
    });

    it("should return false when eidas1-mfa is missing", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "openid",
        idpAmr: ["pwd"],
        isOtpEmailEnabled: true,
      });

      expect(result).toBe(false);
    });
    it("should return false when spEssentialAcr is empty", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: undefined,
        idpAmr: ["pwd"],
        isOtpEmailEnabled: true,
      });

      expect(result).toBe(false);
    });

    it("should return false when amr contains mail", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "eidas1-mfa",
        idpAmr: ["mail"],
        isOtpEmailEnabled: true,
      });

      expect(result).toBe(false);
    });

    it("should return false when isOtpEmailEnabled is false", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "eidas1-mfa",
        idpAmr: ["pwd"],
        isOtpEmailEnabled: false,
      });

      expect(result).toBe(false);
    });
  });

  describe("getFilteredAcrValues()", () => {
    it("should return empty array with no requestedAcrValues provided", () => {
      // When
      const result = service["getFilteredAcrValues"](undefined);

      // Then
      expect(result).toEqual([]);
    });

    it("should filter supported ACR values when given a string", () => {
      const inputAcrValues = "eidas1 eidas2 A";

      // When
      const result = service["getFilteredAcrValues"](inputAcrValues);

      // Then
      expect(result).toEqual(["eidas1", "eidas2"]);
    });

    it("should filter supported ACR values when given an array", () => {
      const inputAcrValues = ["eidas1", "C"];

      // When
      const result = service["getFilteredAcrValues"](inputAcrValues);

      // Then
      expect(result).toEqual(["eidas1"]);
    });
  });

  describe("isEssentialAcrSatisfied()", () => {
    it("should return true when no essential ACR is requested", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {},
        prompt: {
          name: "consent",
          reasons: [],
          details: {},
        },
      } as unknown as ExtendedInteraction;

      const userSessionMock = {
        idpAcr: "eidas1",
        isEmailVerifiedByPcf: false,
        idpAmr: ["pwd"],
      } as Pick<UserSession, "idpAcr" | "isEmailVerifiedByPcf" | "idpAmr">;

      // When
      const result = service.isEssentialAcrSatisfied(
        interactionMock,
        userSessionMock,
      );

      // Then
      expect(result).toBe(true);
    });

    it("should return false when essential ACR is requested but not satisfied", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {},
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
          details: {
            acr: {
              essential: true,
              value: "eidas2",
            },
          },
        },
      } as unknown as ExtendedInteraction;

      const userSessionMock = {
        idpAcr: "eidas1",
        isEmailVerifiedByPcf: true,
        idpAmr: ["pwd"],
      } as Pick<UserSession, "idpAcr" | "isEmailVerifiedByPcf" | "idpAmr">;

      // When
      const result = service.isEssentialAcrSatisfied(
        interactionMock,
        userSessionMock,
      );

      // Then
      expect(result).toBe(false);
    });

    it("should return false when satisfied ACR requires a new session", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {},
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
          details: {
            acr: {
              essential: true,
              values: ["eidas2"],
            },
          },
        },
      } as unknown as ExtendedInteraction;

      const userSessionMock = {
        idpAcr: "eidas2",
        isEmailVerifiedByPcf: true,
        idpAmr: ["pwd"],
      } as Pick<UserSession, "idpAcr" | "isEmailVerifiedByPcf" | "idpAmr">;

      // When
      const result = service.isEssentialAcrSatisfied(
        interactionMock,
        userSessionMock,
      );

      // Then
      expect(result).toBe(false);
    });

    it("should return true when essential ACR is satisfied and does not require a new session", () => {
      // Given
      const interactionMock = {
        uid: "123",
        params: {},
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
          details: {
            acr: {
              essential: true,
              value: "eidas1",
            },
          },
        },
      } as unknown as ExtendedInteraction;

      const userSessionMock = {
        idpAcr: "eidas1",
        isEmailVerifiedByPcf: true,
        idpAmr: ["pwd"],
      } as Pick<UserSession, "idpAcr" | "isEmailVerifiedByPcf" | "idpAmr">;

      // When
      const result = service.isEssentialAcrSatisfied(
        interactionMock,
        userSessionMock,
      );

      // Then
      expect(result).toBe(true);
    });
  });

  describe("computeAreThereEssentialAcrRequested()", () => {
    it("should return true when prompt contains essential_acr reason", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "login",
          reasons: ["essential_acr"],
        },
      } as undefined as ExtendedInteraction;

      // When
      const result =
        service["computeAreThereEssentialAcrRequested"](interactionMock);

      // Then
      expect(result).toBe(true);
    });

    it("should return true when prompt contains essential_acrs reason", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "login",
          reasons: ["essential_acrs"],
        },
      } as undefined as ExtendedInteraction;

      // When
      const result =
        service["computeAreThereEssentialAcrRequested"](interactionMock);

      // Then
      expect(result).toBe(true);
    });

    it("should return false when prompt does not contain essential ACR reasons", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "login",
          reasons: ["other_reasons"],
        },
      } as undefined as ExtendedInteraction;

      // When
      const result =
        service["computeAreThereEssentialAcrRequested"](interactionMock);

      // Then
      expect(result).toBe(false);
    });

    it("should return false when prompt is not a login", () => {
      // Given
      const interactionMock = {
        prompt: {
          name: "interaction-check",
          reasons: ["other_reasons"],
        },
      } as undefined as ExtendedInteraction;

      // When
      const result =
        service["computeAreThereEssentialAcrRequested"](interactionMock);

      // Then
      expect(result).toBe(false);
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
              value: "eidas1",
            },
          },
        },
      } as undefined as ExtendedInteraction;

      jest
        .spyOn(service, "getFilteredAcrValues")
        .mockReturnValueOnce(["eidas1"]);

      // When
      const result =
        service["getFilteredAcrParamsFromInteraction"](interactionMock);

      // Then
      expect(result).toEqual({
        acrClaims: {
          essential: true,
          value: "eidas1",
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
      } as undefined as ExtendedInteraction;

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
