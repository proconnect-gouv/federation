import { ConfigService } from "#libs/config";
import { getConfigMock } from "#mocks/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";

describe(CrossDeviceAuthenticationService.name, () => {
  let service: CrossDeviceAuthenticationService;

  const modelMock = {
    insertOne: jest.fn(),
    find: jest.fn(),
  };
  const configServiceMock = getConfigMock();
  const emojiAlphabet = ["🐶", "🐱", "🦊", "🐼", "🍎", "🍌"];

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    configServiceMock.get.mockReturnValue({
      emojiAlphabet,
      emojiCodeLength: 5,
    });

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CrossDeviceAuthenticationService,
        ConfigService,
        {
          provide: getModelToken("CrossDeviceAuthenticationRequest"),
          useValue: modelMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
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
        emojis: expect.any(Array),
      });
      expect(modelMock.insertOne).toHaveBeenCalledWith({
        status: "initiated",
        emojis: result.emojis,
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "user@example.com",
        browsingSessionId: "browsing-session-id",
      });
    });
  });

  describe("emojis", () => {
    it("should generate distinct emojis from the configured alphabet", async () => {
      modelMock.insertOne.mockResolvedValue({ _id: "request-id" });

      const { emojis } = await service.create({
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "user@example.com",
        browsingSessionId: "browsing-session-id",
      });

      expect(configServiceMock.get).toHaveBeenCalledWith(
        "CrossDeviceAuthentication",
      );
      expect(emojis).toHaveLength(5);
      expect(new Set(emojis).size).toBe(5);
      emojis.forEach((emoji) => expect(emojiAlphabet).toContain(emoji));
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
