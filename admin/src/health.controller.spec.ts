import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const databaseMock = {
    isInitialized: true,
    query: jest.fn(),
  };
  const mongoRepositoryMock = {
    count: jest.fn(),
  };
  const mongoDatabaseMock = {
    isInitialized: true,
    manager: {
      getMongoRepository: jest.fn(() => mongoRepositoryMock),
    },
  };

  const resMock = {
    status: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    databaseMock.isInitialized = true;
    databaseMock.query.mockResolvedValue([{ "?column?": 1 }]);
    mongoDatabaseMock.isInitialized = true;
    mongoDatabaseMock.manager.getMongoRepository.mockReturnValue(
      mongoRepositoryMock,
    );
    mongoRepositoryMock.count.mockResolvedValue(0);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDataSourceToken(), useValue: databaseMock },
        {
          provide: getDataSourceToken("fc-mongo"),
          useValue: mongoDatabaseMock,
        },
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
    it("should return 'ok' when both connections are initialized and reachable", async () => {
      const result = await controller.readyz(resMock as any);
      expect(databaseMock.query).toHaveBeenCalledWith("SELECT 1");
      expect(mongoRepositoryMock.count).toHaveBeenCalled();
      expect(resMock.status).not.toHaveBeenCalled();
      expect(result).toBe("ok");
    });

    // [label, setup, verboseMessage]
    const failureScenarios: [string, () => void, string][] = [
      [
        "database not initialized",
        () => {
          databaseMock.isInitialized = false;
        },
        "[-]postgresDatabase failed (PostgreSQL default database connection not initialized)\n[+]mongoDatabase ok\nreadyz check failed",
      ],
      [
        "database query rejects with Error",
        () => {
          databaseMock.query.mockRejectedValue(
            new Error("connection terminated"),
          );
        },
        "[-]postgresDatabase failed (connection terminated)\n[+]mongoDatabase ok\nreadyz check failed",
      ],
      [
        "database query rejects with non-Error value",
        () => {
          databaseMock.query.mockRejectedValue("connection reset");
        },
        '[-]postgresDatabase failed ("connection reset")\n[+]mongoDatabase ok\nreadyz check failed',
      ],
      [
        "fc-mongo not initialized",
        () => {
          mongoDatabaseMock.isInitialized = false;
        },
        "[+]postgresDatabase ok\n[-]mongoDatabase failed (MongoDB fc-mongo connection not initialized)\nreadyz check failed",
      ],
      [
        "fc-mongo query rejects",
        () => {
          mongoRepositoryMock.count.mockRejectedValue(
            new Error("topology was destroyed"),
          );
        },
        "[+]postgresDatabase ok\n[-]mongoDatabase failed (topology was destroyed)\nreadyz check failed",
      ],
    ];

    describe("plain mode", () => {
      it.each(failureScenarios)(
        "should return 'error' when %s",
        async (_, setup) => {
          setup();
          const result = await controller.readyz(resMock as any);
          expect(resMock.status).toHaveBeenCalledWith(
            HttpStatus.SERVICE_UNAVAILABLE,
          );
          expect(result).toBe("error");
        },
      );
    });

    describe("verbose", () => {
      it("should return verbose output when both connections are initialized and reachable", async () => {
        const result = await controller.readyz(resMock as any, "");
        expect(resMock.status).not.toHaveBeenCalled();
        expect(result).toBe(
          "[+]postgresDatabase ok\n[+]mongoDatabase ok\nreadyz check passed",
        );
      });

      it.each(failureScenarios)(
        "should return verbose output when %s",
        async (_, setup, expectedMessage) => {
          setup();
          const result = await controller.readyz(resMock as any, "");
          expect(resMock.status).toHaveBeenCalledWith(
            HttpStatus.SERVICE_UNAVAILABLE,
          );
          expect(result).toBe(expectedMessage);
        },
      );
    });
  });
});
