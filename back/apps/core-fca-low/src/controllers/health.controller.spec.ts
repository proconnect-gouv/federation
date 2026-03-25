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
  let resMock: { status: jest.Mock };

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

    describe("verbose", () => {
      it("should return verbose output with all checks passing", async () => {
        const result = await controller.readyz(resMock as any, "");

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toBe(
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

        const result = await controller.readyz(resMock as any, "");

        expect(resMock.status).toHaveBeenCalledWith(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
        expect(result).toBe(
          [
            "[-]mongodb failed (Mongo connection not ready (readyState=0))",
            "[-]redis failed (ECONNREFUSED)",
            "[+]api-entreprise ok",
            "readyz check failed",
          ].join("\n"),
        );
      });
    });

    describe("exclude", () => {
      it("should exclude a single check", async () => {
        mongoConnectionMock.readyState = 0;

        const result = await controller.readyz(resMock as any, "", "mongodb");

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toContain("[+]mongodb excluded: ok");
      });

      it("should exclude multiple checks", async () => {
        mongoConnectionMock.readyState = 0;
        redisServiceMock.client.ping.mockRejectedValue(
          new Error("ECONNREFUSED"),
        );

        const result = await controller.readyz(resMock as any, "", [
          "mongodb",
          "redis",
        ]);

        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toContain("[+]mongodb excluded: ok");
        expect(result).toContain("[+]redis excluded: ok");
      });
    });
  });

  describe("readyzCheck", () => {
    it("should return ok for a healthy individual check", async () => {
      const result = await controller.readyzCheck(resMock as any, "mongodb");

      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("[+]mongodb ok");
    });

    it("should return error for a failing individual check", async () => {
      mongoConnectionMock.readyState = 0;

      const result = await controller.readyzCheck(resMock as any, "mongodb");

      expect(resMock.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(result).toBe(
        "[-]mongodb failed (Mongo connection not ready (readyState=0))",
      );
    });

    it("should throw NotFoundException for an unknown check", async () => {
      await expect(
        controller.readyzCheck(resMock as any, "unknown"),
      ).rejects.toThrow('readyz check "unknown" not found');
    });
  });
});
