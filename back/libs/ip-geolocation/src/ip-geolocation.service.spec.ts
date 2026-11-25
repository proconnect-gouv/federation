import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import { getConfigMock } from "#mocks/config";
import { getLoggerMock } from "#mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { IpGeolocationService } from "./ip-geolocation.service";

describe(IpGeolocationService.name, () => {
  let service: IpGeolocationService;

  const configServiceMock = getConfigMock();
  const loggerMock = getLoggerMock();
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  const config = {
    baseUrl: "https://geoip.example.com",
    accountId: "account-id",
    licenseKey: "license-key",
    shouldMockApi: false,
    timeoutInMs: 5000,
  };
  const publicIp = "203.0.112.7";

  beforeEach(async () => {
    jest.resetAllMocks();
    global.fetch = fetchMock;
    configServiceMock.get.mockReturnValue(config);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpGeolocationService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();

    service = module.get(IpGeolocationService);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const mockResponse = (body: object, status = 200) =>
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));

  it("should return the French names of the city and the country", async () => {
    mockResponse({
      city: { names: { en: "London", fr: "Londres" } },
      country: { names: { en: "United Kingdom", fr: "Royaume-Uni" } },
    });

    const result = await service.getLocation(publicIp);

    expect(result).toEqual({ city: "Londres", country: "Royaume-Uni" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://geoip.example.com/geoip/v2.1/city/${publicIp}`,
      {
        headers: { Authorization: "Basic YWNjb3VudC1pZDpsaWNlbnNlLWtleQ==" },
        signal: expect.any(AbortSignal),
      },
    );
  });

  it("should fall back to the English name", async () => {
    mockResponse({
      city: { names: { en: "Smallville" } },
      country: { names: { en: "United States", fr: "États-Unis" } },
    });

    const result = await service.getLocation(publicIp);

    expect(result).toEqual({ city: "Smallville", country: "États-Unis" });
  });

  it("should return the country only when the city is unknown", async () => {
    mockResponse({ country: { names: { fr: "France" } } });

    const result = await service.getLocation(publicIp);

    expect(result).toEqual({ city: undefined, country: "France" });
  });

  it("should return null when neither the city nor the country is known", async () => {
    mockResponse({});

    expect(await service.getLocation(publicIp)).toBeNull();
  });

  it("should return null without logging an error when the address is not found", async () => {
    mockResponse({ code: "IP_ADDRESS_NOT_FOUND" }, 404);

    expect(await service.getLocation(publicIp)).toBeNull();
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it("should look up the IPv4 address of an IPv4-mapped IPv6 address", async () => {
    mockResponse({ country: { names: { fr: "France" } } });

    await service.getLocation(`::ffff:${publicIp}`);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://geoip.example.com/geoip/v2.1/city/${publicIp}`,
      expect.anything(),
    );
  });

  it.each([
    undefined,
    "",
    "not-an-ip",
    "127.0.0.1",
    "10.0.0.1",
    "192.168.65.1",
    "::ffff:192.168.65.1",
    "169.254.1.1",
    "::1",
    "fd00::1",
  ])("should return null without calling the API for %s", async (ip) => {
    expect(await service.getLocation(ip)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should return null and log an error when the API answers with an error", async () => {
    mockResponse({ code: "OUT_OF_QUERIES" }, 402);

    expect(await service.getLocation(publicIp)).toBeNull();
    expect(loggerMock.error).toHaveBeenCalledWith({
      code: "ip-geolocation-error",
      ipGeolocationError: "Unexpected HTTP status 402",
      ipGeolocationErrorCause: undefined,
    });
  });

  it("should return null and log an error when the API does not answer", async () => {
    fetchMock.mockRejectedValue(
      new TypeError("fetch failed", { cause: { code: "ECONNREFUSED" } }),
    );

    expect(await service.getLocation(publicIp)).toBeNull();
    expect(loggerMock.error).toHaveBeenCalledWith({
      code: "ip-geolocation-error",
      ipGeolocationError: "fetch failed",
      ipGeolocationErrorCause: "ECONNREFUSED",
    });
  });

  it("should return null when the API takes too long to answer", async () => {
    configServiceMock.get.mockReturnValue({ ...config, timeoutInMs: 1 });
    fetchMock.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        }),
    );

    expect(await service.getLocation(publicIp)).toBeNull();
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
  });

  it("should return a mocked location for any address, without calling the API", async () => {
    configServiceMock.get.mockReturnValue({ ...config, shouldMockApi: true });

    expect(await service.getLocation("192.168.65.1")).toEqual({
      city: "Paris",
      country: "France",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
