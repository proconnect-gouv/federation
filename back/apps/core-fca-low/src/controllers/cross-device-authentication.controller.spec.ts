import { ConfigService } from "#libs/config";
import {
  CrossDeviceAuthenticationService,
  RequestStatus,
  XdaNotEnabled,
  XdaRequestNotFound,
} from "#libs/cross-device-authentication";
import { CsrfService } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { ISessionService } from "#libs/session";
import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";
import { ActiveUserSessionDto } from "../dto/user-session/active-user-session.dto";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { CrossDeviceAuthenticationController } from "./cross-device-authentication.controller";

describe("CrossDeviceAuthenticationController", () => {
  let controller: CrossDeviceAuthenticationController;

  let crossDeviceAuthenticationServiceMock: any;
  let serviceProviderMock: any;
  let res: Response;

  beforeEach(async () => {
    crossDeviceAuthenticationServiceMock = {
      findOrCreateRequest: jest.fn(),
      getRequestForRequester: jest.fn(),
      getNotReviewedRequests: jest.fn(),
      getRequestForReviewer: jest.fn(),
      markAsEmojisDisplayed: jest.fn(),
      markAsVerificationStarted: jest.fn(),
      review: jest.fn(),
    };
    serviceProviderMock = { getById: jest.fn() };
    res = { render: jest.fn(), redirect: jest.fn() } as unknown as Response;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrossDeviceAuthenticationController],
      providers: [
        CrossDeviceAuthenticationService,
        ServiceProviderAdapterMongoService,
        CsrfService,
        ConfigService,
      ],
    })
      .overrideProvider(CrossDeviceAuthenticationService)
      .useValue(crossDeviceAuthenticationServiceMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderMock)
      .overrideProvider(CsrfService)
      .useValue({
        check: jest.fn(),
        getOrCreate: jest.fn().mockReturnValue("csrf-token"),
      })
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn().mockReturnValue({ urlPrefix: "/api/v2" }) })
      .compile();

    controller = module.get<CrossDeviceAuthenticationController>(
      CrossDeviceAuthenticationController,
    );
    jest.clearAllMocks();
  });

  describe("initiateCrossDeviceAuthentication()", () => {
    const userSession = {
      get: jest.fn().mockReturnValue({
        spId: "sp-id",
        spName: "My SP",
        idpLoginHint: "user@example.com",
        browsingSessionId: "browsing-session-id",
      }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: true });
      crossDeviceAuthenticationServiceMock.findOrCreateRequest.mockResolvedValue(
        {
          _id: "request-id",
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );
    });

    it("should find or create a request and redirect to the flow page", async () => {
      const req = {
        headers: { "user-agent": "Mozilla/5.0" },
      } as unknown as Request;

      await controller.initiateCrossDeviceAuthentication(res, req, userSession);

      expect(
        crossDeviceAuthenticationServiceMock.findOrCreateRequest,
      ).toHaveBeenCalledWith({
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "user@example.com",
        browsingSessionId: "browsing-session-id",
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/api/v2/cross-device-authentication-flow/request-id",
      );
    });

    it("should default the user agent to an empty string when missing", async () => {
      const req = { headers: {} } as unknown as Request;

      await controller.initiateCrossDeviceAuthentication(res, req, userSession);

      expect(
        crossDeviceAuthenticationServiceMock.findOrCreateRequest,
      ).toHaveBeenCalledWith(expect.objectContaining({ userAgent: "" }));
    });

    it("should refuse to create a request when isXdaEnabled is false for the service provider", async () => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: false });
      const req = { headers: {} } as unknown as Request;

      await expect(
        controller.initiateCrossDeviceAuthentication(res, req, userSession),
      ).rejects.toThrow(XdaNotEnabled);

      expect(serviceProviderMock.getById).toHaveBeenCalledWith("sp-id");
      expect(
        crossDeviceAuthenticationServiceMock.findOrCreateRequest,
      ).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe("getCrossDeviceAuthenticationFlow()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ browsingSessionId: "browsing-session-id" }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    it("should render the flow page with the current status", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForRequester.mockResolvedValue(
        {
          status: RequestStatus.VERIFICATION_STARTED,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );

      await controller.getCrossDeviceAuthenticationFlow(
        res,
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.getRequestForRequester,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        browsingSessionId: "browsing-session-id",
      });
      expect(res.render).toHaveBeenCalledWith(
        "cross-device-authentication-flow",
        {
          csrfToken: "csrf-token",
          requestId: "request-id",
          status: RequestStatus.VERIFICATION_STARTED,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );
    });

    it("should throw XdaRequestNotFound when the request is not bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForRequester.mockResolvedValue(
        null,
      );

      await expect(
        controller.getCrossDeviceAuthenticationFlow(
          res,
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);

      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe("markCrossDeviceAuthenticationEmojisAsDisplayed()", () => {
    it("should mark the request of the browsing session as having its emojis displayed", async () => {
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ browsingSessionId: "browsing-session-id" }),
      } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

      await controller.markCrossDeviceAuthenticationEmojisAsDisplayed(
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.markAsEmojisDisplayed,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        browsingSessionId: "browsing-session-id",
      });
    });
  });

  describe("getCrossDeviceAuthenticationRequestStatusForRequester()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ browsingSessionId: "browsing-session-id" }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    it("should only return the status of the request bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForRequester.mockResolvedValue(
        {
          status: RequestStatus.APPROVED,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );

      const result =
        await controller.getCrossDeviceAuthenticationRequestStatusForRequester(
          "request-id",
          userSession,
        );

      expect(
        crossDeviceAuthenticationServiceMock.getRequestForRequester,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        browsingSessionId: "browsing-session-id",
      });
      expect(result).toEqual({ status: RequestStatus.APPROVED });
    });

    it("should throw XdaRequestNotFound when the request is not bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForRequester.mockResolvedValue(
        null,
      );

      await expect(
        controller.getCrossDeviceAuthenticationRequestStatusForRequester(
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
    });
  });

  describe("reviewCrossDeviceAuthenticationRequests()", () => {
    it("should render the requests linked to the reviewer email", async () => {
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<ActiveUserSessionDto>;
      crossDeviceAuthenticationServiceMock.getNotReviewedRequests.mockResolvedValue(
        [{ id: "request-id", spName: "My SP", device: "Firefox sur Windows" }],
      );

      await controller.reviewCrossDeviceAuthenticationRequests(
        res,
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.getNotReviewedRequests,
      ).toHaveBeenCalledWith("user@example.com");
      expect(res.render).toHaveBeenCalledWith(
        "review-cross-device-authentication-request-list",
        {
          csrfToken: "csrf-token",
          notReviewedRequests: [
            {
              id: "request-id",
              spName: "My SP",
              device: "Firefox sur Windows",
            },
          ],
        },
      );
    });
  });

  describe("getCrossDeviceAuthenticationNotReviewedRequests()", () => {
    it("should return the ids of the requests linked to the reviewer email", async () => {
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<ActiveUserSessionDto>;
      crossDeviceAuthenticationServiceMock.getNotReviewedRequests.mockResolvedValue(
        [
          { id: "request-id-1", spName: "My SP", device: "Firefox" },
          { id: "request-id-2", spName: "My SP", device: "Chrome" },
        ],
      );

      const result =
        await controller.getCrossDeviceAuthenticationNotReviewedRequests(
          userSession,
        );

      expect(
        crossDeviceAuthenticationServiceMock.getNotReviewedRequests,
      ).toHaveBeenCalledWith("user@example.com");
      expect(result).toEqual({
        notReviewedRequestIds: ["request-id-1", "request-id-2"],
      });
    });
  });

  describe("reviewCrossDeviceAuthenticationRequest()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ActiveUserSessionDto>;

    it("should start the verification of the request and render its emojis", async () => {
      crossDeviceAuthenticationServiceMock.markAsVerificationStarted.mockResolvedValue(
        {
          status: RequestStatus.VERIFICATION_STARTED,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );

      await controller.reviewCrossDeviceAuthenticationRequest(
        res,
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.markAsVerificationStarted,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
      });
      expect(res.render).toHaveBeenCalledWith(
        "review-cross-device-authentication-request",
        {
          csrfToken: "csrf-token",
          requestId: "request-id",
          status: RequestStatus.VERIFICATION_STARTED,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );
    });

    it("should throw when no not reviewed request matches for the reviewer", async () => {
      crossDeviceAuthenticationServiceMock.markAsVerificationStarted.mockResolvedValue(
        null,
      );

      await expect(
        controller.reviewCrossDeviceAuthenticationRequest(
          res,
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe("getReviewedCrossDeviceAuthenticationRequest()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ActiveUserSessionDto>;

    it.each([RequestStatus.APPROVED, RequestStatus.REJECTED])(
      "should render the request page with the %s status",
      async (status) => {
        crossDeviceAuthenticationServiceMock.getRequestForReviewer.mockResolvedValue(
          { status },
        );

        await controller.getReviewedCrossDeviceAuthenticationRequest(
          res,
          "request-id",
          userSession,
        );

        expect(
          crossDeviceAuthenticationServiceMock.getRequestForReviewer,
        ).toHaveBeenCalledWith({
          requestId: "request-id",
          email: "user@example.com",
        });
        expect(res.render).toHaveBeenCalledWith(
          "review-cross-device-authentication-request",
          { status },
        );
      },
    );

    it.each([
      RequestStatus.VERIFICATION_STARTED,
      RequestStatus.EMOJIS_DISPLAYED,
    ])("should throw when the request is still %s", async (status) => {
      crossDeviceAuthenticationServiceMock.getRequestForReviewer.mockResolvedValue(
        { status },
      );

      await expect(
        controller.getReviewedCrossDeviceAuthenticationRequest(
          res,
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(res.render).not.toHaveBeenCalled();
    });

    it("should throw when no request matches for the reviewer", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForReviewer.mockResolvedValue(
        null,
      );

      await expect(
        controller.getReviewedCrossDeviceAuthenticationRequest(
          res,
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe("getCrossDeviceAuthenticationRequestStatusForReviewer()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ActiveUserSessionDto>;

    it("should return the status of the request of the reviewer", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForReviewer.mockResolvedValue(
        { status: RequestStatus.EMOJIS_DISPLAYED },
      );

      const result =
        await controller.getCrossDeviceAuthenticationRequestStatusForReviewer(
          "request-id",
          userSession,
        );

      expect(
        crossDeviceAuthenticationServiceMock.getRequestForReviewer,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
      });
      expect(result).toEqual({ status: RequestStatus.EMOJIS_DISPLAYED });
    });

    it("should throw when no request matches for the reviewer", async () => {
      crossDeviceAuthenticationServiceMock.getRequestForReviewer.mockResolvedValue(
        null,
      );

      await expect(
        controller.getCrossDeviceAuthenticationRequestStatusForReviewer(
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
    });
  });

  describe.each([
    {
      method: "approveCrossDeviceAuthenticationRequest",
      status: RequestStatus.APPROVED,
    },
    {
      method: "rejectCrossDeviceAuthenticationRequest",
      status: RequestStatus.REJECTED,
    },
  ] as const)("$method()", ({ method, status }) => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ActiveUserSessionDto>;

    it(`should set the request status to ${status} and redirect to the request page`, async () => {
      crossDeviceAuthenticationServiceMock.review.mockResolvedValue(true);

      await controller[method](res, "request-id", userSession);

      expect(crossDeviceAuthenticationServiceMock.review).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
        status,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/api/v2/cross-device-authentication-requests/request-id",
      );
    });

    it("should throw when the emojis of the request are not displayed, or the request is expired or not owned by the reviewer", async () => {
      crossDeviceAuthenticationServiceMock.review.mockResolvedValue(false);

      await expect(
        controller[method](res, "request-id", userSession),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
