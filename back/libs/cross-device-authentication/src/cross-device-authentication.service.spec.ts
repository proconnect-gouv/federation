import { ConfigService } from "#libs/config";
import { getConfigMock } from "#mocks/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";
import { RequestStatus } from "./enums";

describe(CrossDeviceAuthenticationService.name, () => {
  let service: CrossDeviceAuthenticationService;

  const modelMock = {
    insertOne: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const configServiceMock = getConfigMock();
  const emojiAlphabet = ["🐶", "🐱", "🦊", "🐼", "🍎", "🍌"];

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    configServiceMock.get.mockReturnValue({
      emojiAlphabet,
      emojiCodeLength: 5,
      requestExpirationDurationInMs: 5 * 60 * 1000,
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

  describe("getAwaitingRequests", () => {
    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should find the unexpired initiated and pending requests for the lowercased email", async () => {
      modelMock.find.mockResolvedValue([
        {
          id: "request-id",
          status: "initiated",
          spName: "My SP",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        },
      ]);

      const result = await service.getAwaitingRequests("User@Example.com");

      expect(modelMock.find).toHaveBeenCalledWith({
        status: { $in: ["initiated", "pending"] },
        email: "user@example.com",
        createdAt: { $gt: new Date("2026-01-01T09:55:00.000Z") },
      });
      expect(result).toEqual([
        { id: "request-id", spName: "My SP", device: "Firefox sur Windows" },
      ]);
    });
  });

  describe("getRequest", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should only look up a non-expired request bound to the browsing session", async () => {
      modelMock.findOne.mockResolvedValue({
        status: "initiated",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      await service.getRequest({ requestId, browsingSessionId: "bsid" });

      expect(modelMock.findOne).toHaveBeenCalledWith({
        _id: requestId,
        browsingSessionId: "bsid",
        createdAt: { $gt: new Date("2026-01-01T09:55:00.000Z") },
      });
    });

    it("should return the status and the emojis of the request", async () => {
      modelMock.findOne.mockResolvedValue({
        status: "pending",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      const result = await service.getRequest({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(result).toEqual({
        status: "pending",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });

    it("should return null when no request matches", async () => {
      modelMock.findOne.mockResolvedValue(null);

      const result = await service.getRequest({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(result).toBeNull();
    });

    it("should return null without querying when the id is not a valid ObjectId", async () => {
      const result = await service.getRequest({
        requestId: "not-an-object-id",
        browsingSessionId: "bsid",
      });

      expect(result).toBeNull();
      expect(modelMock.findOne).not.toHaveBeenCalled();
    });

    it("should return null without querying when the browsing session id is missing", async () => {
      const result = await service.getRequest({
        requestId,
        browsingSessionId: "",
      });

      expect(result).toBeNull();
      expect(modelMock.findOne).not.toHaveBeenCalled();
    });
  });

  describe("markAsPending", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should set the status of the user's awaiting request to pending", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({
        id: requestId,
        status: "pending",
        spName: "My SP",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      const result = await service.markAsPending({
        requestId,
        email: "User@Example.com",
      });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: requestId,
          status: { $in: ["initiated", "pending"] },
          email: "user@example.com",
          createdAt: { $gt: new Date("2026-01-01T09:55:00.000Z") },
        },
        {
          status: "pending",
          updatedAt: new Date("2026-01-01T10:00:00.000Z"),
        },
        { new: true },
      );
      expect(result).toEqual({
        emojis: ["😀", "😎", "🤖", "👾"],
        device: "Firefox sur Windows",
        spName: "My SP",
      });
    });

    it("should return null when no awaiting request matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.markAsPending({
        requestId,
        email: "user@example.com",
      });

      expect(result).toBeNull();
    });

    it("should return null without querying when the id is not a valid ObjectId", async () => {
      const result = await service.markAsPending({
        requestId: "not-an-object-id",
        email: "user@example.com",
      });

      expect(result).toBeNull();
      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("review", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each([RequestStatus.APPROVED, RequestStatus.REJECTED] as const)(
      "should set the status of the user's unexpired pending request to %s",
      async (status) => {
        modelMock.findOneAndUpdate.mockResolvedValue({ id: requestId });

        const result = await service.review({
          requestId,
          email: "User@Example.com",
          status,
        });

        expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
          {
            _id: requestId,
            status: "pending",
            email: "user@example.com",
            createdAt: { $gt: new Date("2026-01-01T09:55:00.000Z") },
          },
          { status, updatedAt: new Date("2026-01-01T10:00:00.000Z") },
        );
        expect(result).toBe(true);
      },
    );

    it("should return false when no unexpired pending request matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.review({
        requestId,
        email: "user@example.com",
        status: RequestStatus.APPROVED,
      });

      expect(result).toBe(false);
    });

    it("should return false without querying when the id is not a valid ObjectId", async () => {
      const result = await service.review({
        requestId: "not-an-object-id",
        email: "user@example.com",
        status: RequestStatus.APPROVED,
      });

      expect(result).toBe(false);
      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
