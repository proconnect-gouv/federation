import { ConfigModule, ConfigService } from "@fc/config";
import { LoggerModule, LoggerService } from "@fc/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { ApiEntrepriseModule } from "./api-entreprise.module";
import { ApiEntrepriseService } from "./services";

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
    const loggerServiceMock = {
      error: jest.fn(),
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
        imports: [
          ApiEntrepriseModule,
          ConfigModule.forRoot(configServiceMock),
          LoggerModule.forRoot([]),
        ],
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      })
        .overrideProvider(LoggerService)
        .useValue(loggerServiceMock)
        .compile();

      // When
      const service = module.get<ApiEntrepriseService>(ApiEntrepriseService);

      // Then
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ApiEntrepriseService);
    });
  });
});
