import { ApiEntrepriseService } from "@fc/api-entreprise";
import { RedisService } from "@fc/redis";
import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;
  let mongoConnectionMock: { readyState: number };
  let redisServiceMock: { client: { ping: jest.Mock } };
  let apiEntrepriseMock: { getOrganizationBySiret: jest.Mock };
  let resMock: {
    status: jest.Mock;
    setHeader: jest.Mock;
    send: jest.Mock;
  };

  beforeEach(async () => {
    mongoConnectionMock = { readyState: 1 };
    redisServiceMock = {
      client: { ping: jest.fn().mockResolvedValue("PONG") },
    };
    apiEntrepriseMock = {
      getOrganizationBySiret: jest.fn().mockResolvedValue({}),
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn(),
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
      await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(resMock.send).toHaveBeenCalledWith("ok");
    });

    it('should return "error" when MongoDB is disconnected', async () => {
      mongoConnectionMock.readyState = 0;

      await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(resMock.send).toHaveBeenCalledWith("error");
    });

    it('should return "error" when Redis ping fails', async () => {
      redisServiceMock.client.ping.mockRejectedValue(new Error("ECONNREFUSED"));

      await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(resMock.send).toHaveBeenCalledWith("error");
    });

    it('should return "error" when Redis returns unexpected response', async () => {
      redisServiceMock.client.ping.mockResolvedValue("NOT_PONG");

      await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(resMock.send).toHaveBeenCalledWith("error");
    });

    it('should return "error" when API Entreprise fails', async () => {
      apiEntrepriseMock.getOrganizationBySiret.mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      await controller.readyz(resMock as any);

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(resMock.send).toHaveBeenCalledWith("error");
      expect(apiEntrepriseMock.getOrganizationBySiret).toHaveBeenCalledWith(
        "13002526500013",
      );
    });

    describe("verbose", () => {
      it("should return verbose output with all checks passing", async () => {
        await controller.readyz(resMock as any, "");

        expect(resMock.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(resMock.setHeader).toHaveBeenCalledWith(
          "Content-Type",
          "text/plain",
        );
        expect(resMock.send).toHaveBeenCalledWith(
          [
            "[+]mongodb ok",
            "[+]redis ok",
            "[+]api-entreprise ok",
            "readyz check passed",
          ].join("\n"),
        );
      });

      it("should return verbose output with failed checks", async () => {
        mongoConnectionMock.readyState = 0;
        redisServiceMock.client.ping.mockRejectedValue(
          new Error("ECONNREFUSED"),
        );

        await controller.readyz(resMock as any, "");

        expect(resMock.status).toHaveBeenCalledWith(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
        expect(resMock.send).toHaveBeenCalledWith(
          [
            "[-]mongodb failed",
            "[-]redis failed",
            "[+]api-entreprise ok",
            "readyz check failed",
          ].join("\n"),
        );
      });
    });

    describe("exclude", () => {
      it("should exclude a single check", async () => {
        mongoConnectionMock.readyState = 0;

        await controller.readyz(resMock as any, "", "mongodb");

        expect(resMock.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(resMock.send).toHaveBeenCalledWith(
          expect.stringContaining("[+]mongodb excluded: ok"),
        );
      });

      it("should exclude multiple checks", async () => {
        mongoConnectionMock.readyState = 0;
        redisServiceMock.client.ping.mockRejectedValue(
          new Error("ECONNREFUSED"),
        );

        await controller.readyz(resMock as any, "", ["mongodb", "redis"]);

        expect(resMock.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(resMock.send).toHaveBeenCalledWith(
          expect.stringContaining("[+]mongodb excluded: ok"),
        );
        expect(resMock.send).toHaveBeenCalledWith(
          expect.stringContaining("[+]redis excluded: ok"),
        );
      });
    });
  });

  describe("readyzCheck", () => {
    it("should return ok for a healthy individual check", async () => {
      await controller.readyzCheck(resMock as any, "mongodb");

      expect(resMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(resMock.send).toHaveBeenCalledWith("[+]mongodb ok");
    });

    it("should return error for a failing individual check", async () => {
      mongoConnectionMock.readyState = 0;

      await controller.readyzCheck(resMock as any, "mongodb");

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(resMock.send).toHaveBeenCalledWith("[-]mongodb failed");
    });

    it("should return 404 for an unknown check", async () => {
      await controller.readyzCheck(resMock as any, "unknown");

      expect(resMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(resMock.send).toHaveBeenCalledWith(
        'readyz check "unknown" not found',
      );
    });
  });
});
