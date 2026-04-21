import { Test, TestingModule } from "@nestjs/testing";
import { lastValueFrom } from "rxjs";
import { FetchHttpService } from "./fetch-http.service";
import { FETCH_FN, FETCH_REQUEST_INIT } from "./fetch-http.tokens";

describe("FetchHttpService", () => {
  let service: FetchHttpService;

  const fetchMock = jest.fn();
  const getInitMock = jest.fn();

  const responseMock = {
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "text/html; charset=UTF-8" }),
    text: jest.fn().mockResolvedValue("response body"),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    getInitMock.mockReturnValue({});
    responseMock.text.mockResolvedValue("response body");
    fetchMock.mockResolvedValue(responseMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchHttpService,
        { provide: FETCH_FN, useValue: fetchMock },
        { provide: FETCH_REQUEST_INIT, useValue: getInitMock },
      ],
    }).compile();

    service = module.get<FetchHttpService>(FetchHttpService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("get()", () => {
    it("should call fetch with GET method", async () => {
      // Given
      const url = "http://example.com";
      const config = { headers: { "x-custom": "value" } };
      // When
      await lastValueFrom(service.get(url, config));
      // Then
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: "GET",
        headers: config.headers,
      });
    });

    it("should spread getInit into fetch options", async () => {
      // Given
      const signal = AbortSignal.timeout(1000);
      getInitMock.mockReturnValue({ signal });
      // When
      await lastValueFrom(service.get("http://example.com"));
      // Then
      expect(fetchMock).toHaveBeenCalledWith("http://example.com", {
        signal,
        method: "GET",
        headers: undefined,
      });
    });

    it("should call getInit on each request", async () => {
      // When
      await lastValueFrom(service.get("http://example.com"));
      await lastValueFrom(service.get("http://example.com"));
      // Then
      expect(getInitMock).toHaveBeenCalledTimes(2);
    });

    it("should map the response to HttpResponse shape", async () => {
      // When
      const result = await lastValueFrom(service.get("http://example.com"));
      // Then
      expect(result).toMatchObject({
        status: 200,
        statusText: "OK",
        headers: { "content-type": "text/html; charset=UTF-8" },
        data: "response body",
        config: {},
        request: {},
      });
    });
  });

  describe("post()", () => {
    it("should call fetch with POST method and body", async () => {
      // Given
      const url = "http://example.com";
      const body = "request body";
      const config = { headers: { "content-type": "application/json" } };
      // When
      await lastValueFrom(service.post(url, body, config));
      // Then
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: "POST",
        body,
        headers: config.headers,
      });
    });

    it("should call fetch without body when data is undefined", async () => {
      // When
      await lastValueFrom(service.post("http://example.com"));
      // Then
      expect(fetchMock).toHaveBeenCalledWith("http://example.com", {
        method: "POST",
        body: undefined,
        headers: undefined,
      });
    });

    it("should spread getInit into fetch options", async () => {
      // Given
      const signal = AbortSignal.timeout(1000);
      getInitMock.mockReturnValue({ signal });
      // When
      await lastValueFrom(service.post("http://example.com", "data"));
      // Then
      expect(fetchMock).toHaveBeenCalledWith("http://example.com", {
        signal,
        method: "POST",
        body: "data",
        headers: undefined,
      });
    });
  });
});
