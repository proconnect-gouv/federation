import { ConfigModule } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { getConfigMock } from "@mocks/config";
import { HttpService } from "@nestjs/axios";
import { Test } from "@nestjs/testing";
import { CsmrHttpProxyModule } from "./csmr-http-proxy.module";
import { FetchHttpService } from "./http/fetch-http.service";

describe("CsmrHttpProxyModule Dependency Validation", () => {
  it.each(["axios", "fetch"] as const)(
    "should compile successfully with httpClient=%s",
    async (httpClient) => {
      const configServiceMock = getConfigMock();
      configServiceMock.get.mockImplementation(
        (key: string) =>
          ({
            Logger: { threshold: "info" },
            HttpProxyBroker: { requestTimeout: 5000 },
          })[key] || {},
      );

      const moduleFixture = await Test.createTestingModule({
        imports: [
          CsmrHttpProxyModule.register({
            configService: configServiceMock as any,
            httpClient,
          }),
          ConfigModule.forRoot(configServiceMock as any),
          LoggerModule.forRoot([]),
        ],
      }).compile();

      expect(moduleFixture).toBeDefined();
      expect(moduleFixture.get(CsmrHttpProxyModule)).toBeDefined();
    },
  );

  it("should wire FetchHttpService when httpClient=fetch", async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation(
      (key: string) =>
        ({
          Logger: { threshold: "info" },
          HttpProxyBroker: { requestTimeout: 5000 },
        })[key] || {},
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        CsmrHttpProxyModule.register({
          configService: configServiceMock as any,
          httpClient: "fetch",
        }),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture.get(HttpService)).toBeInstanceOf(FetchHttpService);
  });
});
