import { ApiEntrepriseService } from "@fc/api-entreprise";
import { ConfigService } from "@fc/config";
import { RedisService } from "@fc/redis";
import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of, throwError } from "rxjs";
import { CheckTarget, HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;
  let mongoConnectionMock: { readyState: number };
  let redisServiceMock: { client: { ping: jest.Mock } };
  let apiEntrepriseMock: { getOrganizationBySiret: jest.Mock };
  let hyyyperbridgeMock: { send: jest.Mock };
  let configServiceMock: { get: jest.Mock };
  let resMock: { status: jest.Mock };

  beforeEach(async () => {
    mongoConnectionMock = { readyState: 1 };
    redisServiceMock = {
      client: { ping: jest.fn().mockResolvedValue("PONG") },
    };
    apiEntrepriseMock = {
      getOrganizationBySiret: jest.fn().mockResolvedValue({}),
    };
    hyyyperbridgeMock = {
      send: jest.fn().mockReturnValue(of("pong")),
    };
    configServiceMock = {
      get: jest.fn().mockReturnValue({ bypassHybridgeInternet: true }),
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: "DatabaseConnection",
          useValue: mongoConnectionMock,
        },
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
        {
          provide: ApiEntrepriseService,
          useValue: apiEntrepriseMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: "HyyyperbridgeBroker",
          useValue: hyyyperbridgeMock,
        },
      ],
    }).compile();

    controller = app.get<HealthController>(HealthController);
  });

  describe("livez", () => {
    it("should return ok", () => {
      expect(controller.livez()).toBe("ok");
    });
  });

  describe("readyz", () => {
    it('should return "ok" when all services are healthy', async () => {
      const result = await controller.readyz(resMock as any);

      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("ok");
    });

    it('should return "error" when MongoDB is disconnected', async () => {
      mongoConnectionMock.readyState = 0;

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it('should return "error" when Redis ping fails', async () => {
      redisServiceMock.client.ping.mockRejectedValue(new Error("ECONNREFUSED"));

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it('should return "error" when Redis returns unexpected response', async () => {
      redisServiceMock.client.ping.mockResolvedValue("NOT_PONG");

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it('should return "error" when API Entreprise fails', async () => {
      apiEntrepriseMock.getOrganizationBySiret.mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
      expect(apiEntrepriseMock.getOrganizationBySiret).toHaveBeenCalledWith(
        "13002526500013",
      );
    });

    it('should return "error" when a check throws a non-Error value', async () => {
      hyyyperbridgeMock.send.mockReturnValue(throwError(() => ({ err: {} })));

      const result = await controller.readyz(resMock as any, "");

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toContain('[-]hyyyperbridge failed ({"err":{}})');
    });

    it('should return "error" when Hyyyperbridge is unreachable', async () => {
      hyyyperbridgeMock.send.mockReturnValue(
        throwError(() => new Error("ECONNREFUSED")),
      );

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it('should return "error" when Hyyyperbridge returns unexpected response', async () => {
      hyyyperbridgeMock.send.mockReturnValue(of("not-pong"));

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe("error");
    });

    it('should return "ok" when Hyyyperbridge is bypassed', async () => {
      configServiceMock.get.mockReturnValue({ bypassHybridgeInternet: false });

      const result = await controller.readyz(resMock as any);

      expect(resMock.status).not.toHaveBeenCalled();
      expect(hyyyperbridgeMock.send).not.toHaveBeenCalled();
      expect(result).toBe("ok");
    });

    describe("verbose", () => {
      it("should return verbose output with all checks passing", async () => {
        const result = await controller.readyz(resMock as any, "");

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toBe(
          [
            "[+]mongodb ok",
            "[+]redis ok",
            "[+]api-entreprise ok",
            "[+]hyyyperbridge ok",
            "readyz check passed",
          ].join("\n"),
        );
      });

      it("should return verbose output with failed checks", async () => {
        mongoConnectionMock.readyState = 0;
        redisServiceMock.client.ping.mockRejectedValue(
          new Error("ECONNREFUSED"),
        );

        const result = await controller.readyz(resMock as any, "");

        expect(resMock.status).toHaveBeenCalledWith(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
        expect(result).toBe(
          [
            "[-]mongodb failed (Mongo connection not ready (readyState=0))",
            "[-]redis failed (ECONNREFUSED)",
            "[+]api-entreprise ok",
            "[+]hyyyperbridge ok",
            "readyz check failed",
          ].join("\n"),
        );
      });
    });

    describe("exclude", () => {
      it("should exclude a single check", async () => {
        mongoConnectionMock.readyState = 0;

        const result = await controller.readyz(resMock as any, "", [
          CheckTarget.MongoDB,
        ]);

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toContain("[+]mongodb excluded: ok");
      });

      it("should exclude multiple checks", async () => {
        mongoConnectionMock.readyState = 0;
        redisServiceMock.client.ping.mockRejectedValue(
          new Error("ECONNREFUSED"),
        );

        const result = await controller.readyz(resMock as any, "", [
          CheckTarget.MongoDB,
          CheckTarget.Redis,
        ]);

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toContain("[+]mongodb excluded: ok");
        expect(result).toContain("[+]redis excluded: ok");
      });
    });
  });

  describe("readyzCheck", () => {
    it("should return ok for a healthy individual check", async () => {
      const result = await controller.readyzCheck(
        resMock as any,
        CheckTarget.MongoDB,
      );

      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("[+]mongodb ok");
    });

    it("should return error for a failing individual check", async () => {
      mongoConnectionMock.readyState = 0;

      const result = await controller.readyzCheck(
        resMock as any,
        CheckTarget.MongoDB,
      );

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe(
        "[-]mongodb failed (Mongo connection not ready (readyState=0))",
      );
    });
  });
});
