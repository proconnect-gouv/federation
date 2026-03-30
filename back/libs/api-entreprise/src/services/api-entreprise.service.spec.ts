import { Test, TestingModule } from "@nestjs/testing";
import * as mockData from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";

import { ApiEntrepriseClientProvider } from "./api-entreprise-client.provider";
import { ApiEntrepriseService } from "./api-entreprise.service";

describe("ApiEntrepriseService", () => {
  let service: ApiEntrepriseService;
  let apiEntrepriseClientProviderMock = { findBySiret: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiEntrepriseClientProvider, ApiEntrepriseService],
    })
      .overrideProvider(ApiEntrepriseClientProvider)
      .useValue(apiEntrepriseClientProviderMock)
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
  });
});
