import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";

describe(CrossDeviceAuthenticationService.name, () => {
  let service: CrossDeviceAuthenticationService;

  const modelMock = {
    insertOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CrossDeviceAuthenticationService,
        {
          provide: getModelToken("CrossDeviceAuthenticationRequest"),
          useValue: modelMock,
        },
      ],
    })

      .compile();

    service = app.get<CrossDeviceAuthenticationService>(
      CrossDeviceAuthenticationService,
    );
  });

  describe("create", () => {
    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should store an initiated request with a hashed device secret", async () => {
      modelMock.insertOne.mockResolvedValue({ _id: "request-id" });

      const result = await service.create({
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "User@Example.com",
        browsingSessionId: "browsing-session-id",
      });

      expect(result).toEqual({
        _id: "request-id",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });
  });

  describe("getInitiatedRequests", () => {
    it("should find the initiated requests for the lowercased email", async () => {
      const requests = [{ id: "request-id" }];
      modelMock.find.mockResolvedValue(requests);

      const result = await service.getInitiatedRequests("User@Example.com");

      expect(modelMock.find).toHaveBeenCalledWith({
        status: "initiated",
        email: "user@example.com",
      });
      expect(result).toBe(requests);
    });
  });
});
