import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of, throwError } from "rxjs";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const brokerMock = {
    emit: jest.fn().mockReturnValue(of(undefined)),
  };

  const resMock = {
    status: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    brokerMock.emit.mockReturnValue(of(undefined));

    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: "HttpProxyBroker", useValue: brokerMock }],
    }).compile();

    controller = app.get<HealthController>(HealthController);
  });

  describe("livez()", () => {
    it("should return 'ok'", () => {
      expect(controller.livez()).toBe("ok");
    });
  });

  describe("readyz()", () => {
    it("should return 'ok' when broker is reachable", async () => {
      const result = await controller.readyz(resMock as any);
      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("ok");
    });

    it("should return 'error' when broker is unreachable", async () => {
      brokerMock.emit.mockReturnValue(
        throwError(() => new Error("ECONNREFUSED")),
      );
      const result = await controller.readyz(resMock as any);
      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });
  });
});
