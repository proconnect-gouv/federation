import { ConfigModule } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { getConfigMock } from "@mocks/config";
import { Test } from "@nestjs/testing";
import { CsmrHttpProxyModule } from "./csmr-http-proxy.module";

describe("CsmrHttpProxyModule Dependency Validation", () => {
  const baseConfig = {
    Logger: { threshold: "info" },
    LoggerLegacy: {},
    HttpProxyBroker: { requestTimeout: 5000, proxyDisabled: false },
  };

  it("should compile successfully with minimal config", async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation(
      (key: string) => baseConfig[key] ?? null,
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        CsmrHttpProxyModule,
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(CsmrHttpProxyModule)).toBeDefined();
  });

  it("should compile with proxy: false when proxyDisabled is true", async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation(
      (key: string) =>
        ({
          ...baseConfig,
          HttpProxyBroker: {
            ...baseConfig.HttpProxyBroker,
            proxyDisabled: true,
          },
        })[key] ?? null,
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        CsmrHttpProxyModule,
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(CsmrHttpProxyModule)).toBeDefined();
  });
});
