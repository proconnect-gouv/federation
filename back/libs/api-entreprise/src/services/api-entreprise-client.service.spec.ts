import { ConfigService } from "@fc/config";
import { ApiEntrepriseClientService } from "./api-entreprise-client.service";

jest.mock(
  "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret",
  () => ({ MaireClamart: { siret: "21920023500014" } }),
);
jest.mock("node-fetch", () => jest.fn());

global.fetch = jest.fn();

describe("ApiEntrepriseClientProvider", () => {
  describe("ApiEntrepriseClientProvider", () => {
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(() => {
      mockConfigService = {
        get: jest.fn(),
      } as unknown as jest.Mocked<ConfigService>;
    });

    it("should return mock client when shouldMockApi is true and siret matches", async () => {
      mockConfigService.get.mockReturnValue({
        baseUrl: "http://api.test",
        token: "test-token",
        shouldMockApi: true,
        organizationSiret: "12345678901234",
      });

      const provider = new ApiEntrepriseClientService(mockConfigService);
      const result = await provider.findBySiret("21920023500014");

      expect(result).toBeDefined();
    });

    it("should return mock client when shouldMockApi is true and siret does not match", async () => {
      mockConfigService.get.mockReturnValue({
        baseUrl: "http://api.test",
        token: "test-token",
        shouldMockApi: true,
        organizationSiret: "12345678901234",
      });

      const provider = new ApiEntrepriseClientService(mockConfigService);
      const result = await provider.findBySiret("21920023500015");

      expect(result).toBeDefined();
    });

    it("should return actual client when shouldMockApi is false", async () => {
      mockConfigService.get.mockReturnValue({
        baseUrl: "http://api.test",
        token: "test-token",
        shouldMockApi: false,
        organizationSiret: "12345678901234",
      });
      const mockedEstablishment = { siret: "21920023500014" };
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify({ data: mockedEstablishment }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": "27",
          },
        }),
      );

      const provider = new ApiEntrepriseClientService(mockConfigService);
      const result = await provider.findBySiret("21920023500014");

      expect(result).toEqual(mockedEstablishment);
    });
  });
});
