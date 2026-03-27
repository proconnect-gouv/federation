import { Test, TestingModule } from "@nestjs/testing";
import * as mockData from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";

import { LoggerService } from "@fc/logger";
import { omitBy } from "lodash";
import { ApiEntrepriseClientProvider } from "./api-entreprise-client.provider";
import { ApiEntrepriseService } from "./api-entreprise.service";

describe("ApiEntrepriseService", () => {
  let service: ApiEntrepriseService;
  let apiEntrepriseClientProviderMock = { findBySiret: jest.fn() };
  let loggerMock = { error: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiEntrepriseClientProvider,
        LoggerService,
        ApiEntrepriseService,
      ],
    })
      .overrideProvider("ApiEntrepriseClient")
      .useValue(apiEntrepriseClientProviderMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<ApiEntrepriseService>(ApiEntrepriseService);
  });

  describe("getOrganizationBySiret", () => {
    it("should return mock data", async () => {
      const siret = mockData.MaireClamart.siret;
      apiEntrepriseClientProviderMock.findBySiret.mockResolvedValue(
        mockData.MaireClamart,
      );

      await service.getOrganizationBySiret(siret);

      expect(apiEntrepriseClientProviderMock.findBySiret).toHaveBeenCalledWith(
        siret,
      );
    });
    it("should log and rethrow error when finding by siret fails", async () => {
      const siret = "12345678901234";
      const mockError = new Error("API error");
      apiEntrepriseClientProviderMock.findBySiret.mockRejectedValue(mockError);

      await expect(service.getOrganizationBySiret(siret)).rejects.toThrow(
        mockError,
      );
    });

    it("should log and rethrow error when mapping organization fails", async () => {
      const siret = mockData.MaireClamart.siret;
      apiEntrepriseClientProviderMock.findBySiret.mockResolvedValue(
        omitBy(mockData.MaireClamart, (_value, key) => key === "siret"),
      );
      const mockError = new Error("Mapping error");

      await expect(service.getOrganizationBySiret(siret)).rejects.toThrow();
    });
  });
});
