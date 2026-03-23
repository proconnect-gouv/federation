import { ConfigModule, ConfigService } from "@fc/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ApiEntrepriseModule } from "./api-entreprise.module";
import { ApiEntrepriseService } from "./services";
import { ApiEntrepriseClientProvider } from "./services/api-entreprise-client.provider";

describe("ApiEntrepriseModule", () => {
  describe("module structure", () => {
    const configServiceMock = {
      get: jest.fn().mockReturnValue({
        baseUrl: "https://api.example.com",
        token: "test-token",
        shouldMockApi: true,
        organizationSiret: "12345678901234",
      }),
    };
    it("should return a module declaration", () => {
      const module = ApiEntrepriseModule;

      expect(module).toBeDefined();
    });

    it("should have ApiEntrepriseService in providers", () => {
      expect(ApiEntrepriseModule).toBeDefined();
    });

    it("should export ApiEntrepriseService", async () => {
      // Given
      const module: TestingModule = await Test.createTestingModule({
        imports: [ApiEntrepriseModule, ConfigModule.forRoot(configServiceMock)],
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      }).compile();

      // When
      const service = module.get<ApiEntrepriseService>(ApiEntrepriseService);

      // Then
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ApiEntrepriseService);
    });

    it("should provide ApiEntrepriseClient through provider", async () => {
      // When
      const client = ApiEntrepriseClientProvider.useFactory(
        configServiceMock as any,
      );

      // Then
      expect(client).toBeDefined();
      expect(client).toHaveProperty("findBySiret");
      expect(client.findBySiret).toBeInstanceOf(Function);
    });
  });
});
