import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import { getConfigMock } from "#mocks/config";
import { getLoggerMock } from "#mocks/logger";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";
import { RequestStatus } from "./enums";
import { XdaReviewerSessionService } from "./xda-reviewer-session.service";

const notExpiredFilter = {
  $or: [
    {
      status: "created",
      createdAt: { $gt: new Date("2026-01-01T09:00:00.000Z") },
    },
    {
      status: { $ne: "created" },
      startedAt: { $gt: new Date("2026-01-01T09:55:00.000Z") },
    },
  ],
};

describe(CrossDeviceAuthenticationService.name, () => {
  let service: CrossDeviceAuthenticationService;

  const modelMock = {
    insertOne: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const configServiceMock = getConfigMock();
  const loggerMock = getLoggerMock();
  const xdaReviewerSessionMock = { save: jest.fn(), getAndDelete: jest.fn() };
  const emojiAlphabet = ["🐶", "🐱", "🦊", "🐼", "🍎", "🍌"];

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    configServiceMock.get.mockReturnValue({
      emojiAlphabet,
      emojiCodeLength: 5,
      requestExpirationDurationInMs: 5 * 60 * 1000,
      maxDelayBetweenRequestCreationAndVerificationStartInMs: 60 * 60 * 1000,
    });

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CrossDeviceAuthenticationService,
        ConfigService,
        {
          provide: getModelToken("CrossDeviceAuthenticationRequest"),
          useValue: modelMock,
        },
        {
          provide: XdaReviewerSessionService,
          useValue: xdaReviewerSessionMock,
        },
        { provide: LoggerService, useValue: loggerMock },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = app.get<CrossDeviceAuthenticationService>(
      CrossDeviceAuthenticationService,
    );
  });

  const expectTrackedOnce = (event: string, requestId: string) => {
    expect(loggerMock.track).toHaveBeenCalledTimes(1);
    expect(loggerMock.track).toHaveBeenCalledWith(event, {
      crossDeviceAuthenticationRequestId: requestId,
    });
  };

  describe("findOrCreateRequest", () => {
    const params = {
      userAgent: "Mozilla/5.0",
      spName: "My SP",
      email: "User@Example.com",
      browsingSessionId: "browsing-session-id",
    };

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return the latest unexpired and not reviewed request of the browsing session for the lowercased email and the service provider", async () => {
      modelMock.findOne.mockResolvedValue({ _id: "existing-request-id" });

      const result = await service.findOrCreateRequest(params);

      expect(modelMock.findOne).toHaveBeenCalledWith(
        {
          status: {
            $in: ["created", "verification_started", "emojis_displayed"],
          },
          spName: "My SP",
          email: "user@example.com",
          browsingSessionId: "browsing-session-id",
          ...notExpiredFilter,
        },
        { _id: true },
        { sort: { createdAt: -1 } },
      );
      expect(modelMock.insertOne).not.toHaveBeenCalled();
      expect(loggerMock.track).not.toHaveBeenCalled();
      expect(result).toEqual({ _id: "existing-request-id" });
    });

    it("should store a created request when there is no recent request", async () => {
      modelMock.findOne.mockResolvedValue(null);
      modelMock.insertOne.mockResolvedValue({ _id: "request-id" });

      const result = await service.findOrCreateRequest(params);

      expect(result).toEqual({ _id: "request-id" });
      expect(modelMock.insertOne).toHaveBeenCalledWith({
        status: "created",
        emojis: expect.any(Array),
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "user@example.com",
        browsingSessionId: "browsing-session-id",
      });
      expectTrackedOnce("FC_CROSS_DEVICE_AUTHENTICATION_CREATED", "request-id");
    });

    it("should generate distinct emojis from the configured alphabet", async () => {
      modelMock.findOne.mockResolvedValue(null);
      modelMock.insertOne.mockResolvedValue({ _id: "request-id" });

      await service.findOrCreateRequest(params);

      const { emojis } = modelMock.insertOne.mock.calls[0][0];
      expect(configServiceMock.get).toHaveBeenCalledWith(
        "CrossDeviceAuthentication",
      );
      expect(emojis).toHaveLength(5);
      expect(new Set(emojis).size).toBe(5);
      emojis.forEach((emoji: string) => expect(emojiAlphabet).toContain(emoji));
    });
  });

  describe("getNotReviewedRequests", () => {
    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should find the unexpired not reviewed requests for the lowercased email", async () => {
      modelMock.find.mockResolvedValue([
        {
          id: "request-id",
          status: "created",
          spName: "My SP",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
          createdAt: new Date("2026-01-01T09:58:00.000Z"),
        },
      ]);

      const result = await service.getNotReviewedRequests("User@Example.com");

      expect(modelMock.find).toHaveBeenCalledWith({
        status: {
          $in: ["created", "verification_started", "emojis_displayed"],
        },
        email: "user@example.com",
        ...notExpiredFilter,
      });
      expect(result).toEqual([
        {
          id: "request-id",
          spName: "My SP",
          device: "Firefox sur Windows",
          createdAt: new Date("2026-01-01T09:58:00.000Z"),
        },
      ]);
    });
  });

  describe("getRequestForRequester", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should only look up a non-expired request bound to the browsing session", async () => {
      modelMock.findOne.mockResolvedValue({
        status: "created",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      await service.getRequestForRequester({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(modelMock.findOne).toHaveBeenCalledWith({
        _id: requestId,
        browsingSessionId: "bsid",
        ...notExpiredFilter,
      });
    });

    it("should return the status and the emojis of the request", async () => {
      modelMock.findOne.mockResolvedValue({
        status: "verification_started",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      const result = await service.getRequestForRequester({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(result).toEqual({
        status: "verification_started",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });

    it("should return null when no request matches", async () => {
      modelMock.findOne.mockResolvedValue(null);

      const result = await service.getRequestForRequester({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(result).toBeNull();
    });

    it("should return null without querying when the id is not a valid ObjectId", async () => {
      const result = await service.getRequestForRequester({
        requestId: "not-an-object-id",
        browsingSessionId: "bsid",
      });

      expect(result).toBeNull();
      expect(modelMock.findOne).not.toHaveBeenCalled();
    });

    it("should return null without querying when the browsing session id is missing", async () => {
      const result = await service.getRequestForRequester({
        requestId,
        browsingSessionId: "",
      });

      expect(result).toBeNull();
      expect(modelMock.findOne).not.toHaveBeenCalled();
    });
  });

  describe("getRequestForReviewer", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return the status of the reviewer's non-expired request", async () => {
      modelMock.findOne.mockResolvedValue({ status: "approved" });

      const result = await service.getRequestForReviewer({
        requestId,
        email: "User@Example.com",
      });

      expect(modelMock.findOne).toHaveBeenCalledWith({
        _id: requestId,
        email: "user@example.com",
        ...notExpiredFilter,
      });
      expect(result).toEqual({ status: "approved" });
    });

    it("should return null when no request matches", async () => {
      modelMock.findOne.mockResolvedValue(null);

      const result = await service.getRequestForReviewer({
        requestId,
        email: "user@example.com",
      });

      expect(result).toBeNull();
    });

    it("should return null without querying when the id is not a valid ObjectId", async () => {
      const result = await service.getRequestForReviewer({
        requestId: "not-an-object-id",
        email: "user@example.com",
      });

      expect(result).toBeNull();
      expect(modelMock.findOne).not.toHaveBeenCalled();
    });
  });

  describe("markAsVerificationStarted", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should set the status of the reviewer's not reviewed request to verification_started, unless the emojis are already displayed", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({
        id: requestId,
        status: "created",
        spName: "My SP",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      const result = await service.markAsVerificationStarted({
        requestId,
        email: "User@Example.com",
      });

      const now = new Date("2026-01-01T10:00:00.000Z");
      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: requestId,
          status: {
            $in: ["created", "verification_started", "emojis_displayed"],
          },
          email: "user@example.com",
          ...notExpiredFilter,
        },
        [
          {
            $set: {
              status: {
                $cond: [
                  { $eq: ["$status", "emojis_displayed"] },
                  "$status",
                  "verification_started",
                ],
              },
              updatedAt: now,
              startedAt: { $ifNull: ["$startedAt", now] },
            },
          },
        ],
        { updatePipeline: true },
      );
      expectTrackedOnce(
        "FC_CROSS_DEVICE_AUTHENTICATION_VERIFICATION_STARTED",
        requestId,
      );
      expect(result).toEqual({
        status: "verification_started",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });

    it.each(["verification_started", "emojis_displayed"])(
      "should keep the %s status without tracking it again",
      async (status) => {
        modelMock.findOneAndUpdate.mockResolvedValue({
          id: requestId,
          status,
          emojis: ["😀", "😎", "🤖", "👾"],
        });

        const result = await service.markAsVerificationStarted({
          requestId,
          email: "user@example.com",
        });

        expect(loggerMock.track).not.toHaveBeenCalled();
        expect(result).toEqual({ status, emojis: ["😀", "😎", "🤖", "👾"] });
      },
    );

    it("should return null when no not reviewed request matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.markAsVerificationStarted({
        requestId,
        email: "user@example.com",
      });

      expect(result).toBeNull();
    });

    it("should return null without querying when the id is not a valid ObjectId", async () => {
      const result = await service.markAsVerificationStarted({
        requestId: "not-an-object-id",
        email: "user@example.com",
      });

      expect(result).toBeNull();
      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("markAsEmojisDisplayed", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should set the status of the request of the browsing session whose verification started to emojis_displayed", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({ id: requestId });

      await service.markAsEmojisDisplayed({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: requestId,
          status: "verification_started",
          browsingSessionId: "bsid",
          ...notExpiredFilter,
        },
        {
          status: "emojis_displayed",
          updatedAt: new Date("2026-01-01T10:00:00.000Z"),
        },
      );
      expectTrackedOnce(
        "FC_CROSS_DEVICE_AUTHENTICATION_EMOJIS_DISPLAYED",
        requestId,
      );
    });

    it("should not track anything when no request whose verification started matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      await service.markAsEmojisDisplayed({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(loggerMock.track).not.toHaveBeenCalled();
    });

    it.each([
      { requestId: "not-an-object-id", browsingSessionId: "bsid" },
      { requestId, browsingSessionId: "" },
    ])(
      "should not query when the id is invalid or the browsing session id is missing (%o)",
      async (params) => {
        await service.markAsEmojisDisplayed(params);

        expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
      },
    );
  });

  describe("review", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";
    const filter = {
      _id: requestId,
      status: "emojis_displayed",
      email: "user@example.com",
      ...notExpiredFilter,
    };

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should approve the reviewer's unexpired request with displayed emojis, and store the session of the reviewer until the request expires", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({
        id: requestId,
        startedAt: new Date("2026-01-01T09:57:00.000Z"),
      });

      const result = await service.review({
        requestId,
        email: "User@Example.com",
        status: RequestStatus.APPROVED,
        reviewerSessionId: "reviewer-session-id",
      });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(filter, {
        status: "approved",
        updatedAt: new Date("2026-01-01T10:00:00.000Z"),
      });
      expect(xdaReviewerSessionMock.save).toHaveBeenCalledWith({
        requestId,
        reviewerSessionId: "reviewer-session-id",
        ttlInMs: 2 * 60 * 1000,
      });
      expectTrackedOnce("FC_CROSS_DEVICE_AUTHENTICATION_APPROVED", requestId);
      expect(result).toBe(true);
    });

    it("should store the session of the reviewer with a positive TTL when the request has just expired", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({
        id: requestId,
        startedAt: new Date("2026-01-01T09:55:00.000Z"),
      });

      await service.review({
        requestId,
        email: "User@Example.com",
        status: RequestStatus.APPROVED,
        reviewerSessionId: "reviewer-session-id",
      });

      expect(xdaReviewerSessionMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ ttlInMs: 1 }),
      );
    });

    it("should reject the reviewer's unexpired request with displayed emojis, without storing the session of the reviewer", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({ id: requestId });

      const result = await service.review({
        requestId,
        email: "User@Example.com",
        status: RequestStatus.REJECTED,
        reviewerSessionId: "reviewer-session-id",
      });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(filter, {
        status: "rejected",
        updatedAt: new Date("2026-01-01T10:00:00.000Z"),
      });
      expect(xdaReviewerSessionMock.save).not.toHaveBeenCalled();
      expectTrackedOnce("FC_CROSS_DEVICE_AUTHENTICATION_REJECTED", requestId);
      expect(result).toBe(true);
    });

    it("should return false when no unexpired request with displayed emojis matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.review({
        requestId,
        email: "user@example.com",
        status: RequestStatus.APPROVED,
        reviewerSessionId: "reviewer-session-id",
      });

      expect(result).toBe(false);
      expect(xdaReviewerSessionMock.save).not.toHaveBeenCalled();
      expect(loggerMock.track).not.toHaveBeenCalled();
    });

    it("should return false without querying when the id is not a valid ObjectId", async () => {
      const result = await service.review({
        requestId: "not-an-object-id",
        email: "user@example.com",
        status: RequestStatus.APPROVED,
        reviewerSessionId: "reviewer-session-id",
      });

      expect(result).toBe(false);
      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("consume", () => {
    const requestId = "65a1b2c3d4e5f60718293a4b";

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each(["reviewer-session-id", null])(
      "should consume the approved request of the browsing session, and get and delete the session of its reviewer (%s)",
      async (reviewerSessionId) => {
        modelMock.findOneAndUpdate.mockResolvedValue({ id: requestId });
        xdaReviewerSessionMock.getAndDelete.mockResolvedValue(
          reviewerSessionId,
        );

        const result = await service.consume({
          requestId,
          browsingSessionId: "bsid",
        });

        expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
          {
            _id: requestId,
            status: "approved",
            browsingSessionId: "bsid",
            ...notExpiredFilter,
          },
          {
            status: "consumed",
            updatedAt: new Date("2026-01-01T10:00:00.000Z"),
          },
        );
        expect(xdaReviewerSessionMock.getAndDelete).toHaveBeenCalledWith(
          requestId,
        );
        expectTrackedOnce("FC_CROSS_DEVICE_AUTHENTICATION_CONSUMED", requestId);
        expect(result).toEqual({ reviewerSessionId });
      },
    );

    it("should return null without getting the session of the reviewer when no approved request matches", async () => {
      modelMock.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.consume({
        requestId,
        browsingSessionId: "bsid",
      });

      expect(result).toBeNull();
      expect(xdaReviewerSessionMock.getAndDelete).not.toHaveBeenCalled();
      expect(loggerMock.track).not.toHaveBeenCalled();
    });

    it.each([
      { requestId: "not-an-object-id", browsingSessionId: "bsid" },
      { requestId, browsingSessionId: "" },
    ])(
      "should return null without querying when the id is invalid or the browsing session id is missing (%o)",
      async (params) => {
        const result = await service.consume(params);

        expect(result).toBeNull();
        expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
      },
    );
  });
});
