import { LoggerService } from "@fc/logger";
import { getLoggerMock } from "@mocks/logger";
import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of, throwError } from "rxjs";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const brokerMock = {
    send: jest.fn().mockReturnValue(of("pong")),
  };

  const loggerMock = getLoggerMock();

  const resMock = {
    status: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    brokerMock.send.mockReturnValue(of("pong"));

    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: "HttpProxyBroker", useValue: brokerMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();

    controller = app.get<HealthController>(HealthController);
  });

  describe("livez()", () => {
    it("should return 'ok'", () => {
      expect(controller.livez()).toBe("ok");
    });
  });

  describe("readyz()", () => {
    it("should return 'ok' when broker responds pong", async () => {
      const result = await controller.readyz(resMock as any);
      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("ok");
    });

    it("should return 'error' when broker is unreachable", async () => {
      brokerMock.send.mockReturnValue(
        throwError(() => new Error("ECONNREFUSED")),
      );
      const result = await controller.readyz(resMock as any);
      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it("should return 'error' when broker returns unexpected response", async () => {
      brokerMock.send.mockReturnValue(of("not-pong"));
      const result = await controller.readyz(resMock as any);
      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it("should return 'error' when broker throws a non-Error value", async () => {
      brokerMock.send.mockReturnValue(throwError(() => ({ code: 503 })));
      const result = await controller.readyz(resMock as any, "");
      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe(
        '[-]broker failed ({"code":503})\nreadyz check failed',
      );
    });

    describe("verbose", () => {
      it("should return verbose output when broker responds pong", async () => {
        const result = await controller.readyz(resMock as any, "");
        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toBe("[+]broker ok\nreadyz check passed");
      });

      it("should return verbose output when broker is unreachable", async () => {
        brokerMock.send.mockReturnValue(
          throwError(() => new Error("ECONNREFUSED")),
        );
        const result = await controller.readyz(resMock as any, "");
        expect(resMock.status).toHaveBeenCalledWith(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
        expect(result).toBe(
          "[-]broker failed (ECONNREFUSED)\nreadyz check failed",
        );
      });
    });
  });
});
