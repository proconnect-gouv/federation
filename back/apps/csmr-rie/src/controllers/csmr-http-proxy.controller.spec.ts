import { MessageType } from "@fc/hybridge-http-proxy";
import { LoggerService } from "@fc/logger";
import { HttpProxyProtocol } from "@fc/microservices";
import { getLoggerMock } from "@mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { CsmrHttpProxyController } from "./csmr-http-proxy.controller";

describe("CsmrHttpProxyController", () => {
  let controller: CsmrHttpProxyController;

  const loggerServiceMock = getLoggerMock();

  const payloadMock = {
    url: "https://example.com/foo",
    method: "get",
    headers: {
      host: "example.com",
      connection: "keep-alive",
    },
    data: "foo=bar",
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsmrHttpProxyController],
      providers: [LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    controller = module.get<CsmrHttpProxyController>(CsmrHttpProxyController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("healthcheck()", () => {
    it("should return 'ok'", () => {
      const result = controller.healthcheck();
      expect(result).toBe("ok");
    });
  });

  describe("proxyRequest()", () => {
    it("should log received command", async () => {
      // Given
      const fetchResponse = {
        status: 200,
        statusText: "OK",
        text: jest.fn().mockResolvedValueOnce("response body"),
        headers: new Headers({ "content-type": "text/html" }),
      };
      jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

      // When
      await controller.proxyRequest(payloadMock as any);

      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith({
        msg: `received new ${HttpProxyProtocol.Commands.HTTP_PROXY} command`,
        payload: payloadMock,
      });
    });

    describe("connection header handling", () => {
      it("should keep connection header when value is 'keep-alive'", async () => {
        // Given
        const payload = {
          ...payloadMock,
          headers: { ...payloadMock.headers, connection: "keep-alive" },
        };
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce(""),
          headers: new Headers(),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        await controller.proxyRequest(payload as any);

        // Then
        const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
          .headers as Headers;
        expect(calledHeaders.get("connection")).toBe("keep-alive");
      });

      it("should keep connection header when value is 'close'", async () => {
        // Given
        const payload = {
          ...payloadMock,
          headers: { ...payloadMock.headers, connection: "close" },
        };
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce(""),
          headers: new Headers(),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        await controller.proxyRequest(payload as any);

        // Then
        const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
          .headers as Headers;
        expect(calledHeaders.get("connection")).toBe("close");
      });

      it("should delete connection header when value is not 'keep-alive' or 'close'", async () => {
        // Given
        const payload = {
          ...payloadMock,
          headers: {
            ...payloadMock.headers,
            connection: "upgrade, keep-alive",
          },
        };
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce(""),
          headers: new Headers(),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        await controller.proxyRequest(payload as any);

        // Then
        const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
          .headers as Headers;
        expect(calledHeaders.get("connection")).toBeNull();
      });
    });

    describe("successful fetch", () => {
      it("should call fetch with correct parameters", async () => {
        // Given
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce("response body"),
          headers: new Headers({ "content-type": "text/html" }),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        await controller.proxyRequest(payloadMock as any);

        // Then
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          payloadMock.url,
          expect.objectContaining({
            method: payloadMock.method,
            body: payloadMock.data,
          }),
        );
      });

      it("should pass null body when data is undefined", async () => {
        // Given
        const payload = { ...payloadMock, data: undefined };
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce(""),
          headers: new Headers(),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        await controller.proxyRequest(payload as any);

        // Then
        expect(global.fetch).toHaveBeenCalledWith(
          payload.url,
          expect.objectContaining({
            body: null,
          }),
        );
      });

      it("should return DATA response with status, data, statusText and headers", async () => {
        // Given
        const fetchResponse = {
          status: 200,
          statusText: "OK",
          text: jest.fn().mockResolvedValueOnce("response body"),
          headers: new Headers({
            "content-type": "text/html",
            "x-custom": "value",
          }),
        };
        jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResponse as any);

        // When
        const result = await controller.proxyRequest(payloadMock as any);

        // Then
        expect(result).toEqual({
          type: MessageType.DATA,
          data: {
            status: 200,
            data: "response body",
            statusText: "OK",
            headers: {
              "content-type": "text/html",
              "x-custom": "value",
            },
          },
        });
      });
    });

    describe("failed fetch", () => {
      it("should return ERROR response when fetch throws", async () => {
        // Given
        const error = new Error("fetch failed");
        jest.spyOn(global, "fetch").mockRejectedValueOnce(error);

        // When
        const result = await controller.proxyRequest(payloadMock as any);

        // Then
        expect(result).toEqual({
          type: MessageType.ERROR,
          data: {
            reason: "fetch failed",
            name: "Error",
            code: undefined,
          },
        });
      });

      it("should include cause message in reason when error has a cause", async () => {
        // Given
        const error = new Error("fetch failed", {
          cause: new Error("connection refused"),
        });
        jest.spyOn(global, "fetch").mockRejectedValueOnce(error);

        // When
        const result = await controller.proxyRequest(payloadMock as any);

        // Then
        expect(result).toEqual({
          type: MessageType.ERROR,
          data: {
            reason: "fetch failed (connection refused)",
            name: "Error",
            code: undefined,
          },
        });
      });

      it("should use cause name and code when available", async () => {
        // Given
        const cause = new Error("connection refused");
        (cause as any).name = "ConnectionError";
        (cause as any).code = "ECONNREFUSED";
        const error = new Error("fetch failed", { cause });
        jest.spyOn(global, "fetch").mockRejectedValueOnce(error);

        // When
        const result = await controller.proxyRequest(payloadMock as any);

        // Then
        expect(result).toEqual({
          type: MessageType.ERROR,
          data: {
            reason: "fetch failed (connection refused)",
            name: "ConnectionError",
            code: "ECONNREFUSED",
          },
        });
      });

      it("should log error data", async () => {
        // Given
        const error = new Error("fetch failed");
        jest.spyOn(global, "fetch").mockRejectedValueOnce(error);

        // When
        await controller.proxyRequest(payloadMock as any);

        // Then
        expect(loggerServiceMock.error).toHaveBeenCalledTimes(1);
        expect(loggerServiceMock.error).toHaveBeenCalledWith({
          errorData: {
            reason: "fetch failed",
            name: "Error",
            code: undefined,
          },
        });
      });
    });
  });
});
