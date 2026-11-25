import { ConfigService } from "#libs/config";
import {
  CrossDeviceAuthenticationService,
  RequestStatus,
  XdaNotEnabled,
  XdaRequestNotFound,
  XdaReviewerSessionInvalid,
} from "#libs/cross-device-authentication";
import { CsrfService } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { ISessionService, SessionService } from "#libs/session";
import { Test, TestingModule } from "@nestjs/testing";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { ReviewerSessionDto } from "../dto/user-session/reviewer-session.dto";
import { CrossDeviceAuthenticationController } from "./cross-device-authentication.controller";

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));

describe("CrossDeviceAuthenticationController", () => {
  let controller: CrossDeviceAuthenticationController;

  let crossDeviceAuthenticationServiceMock: any;
  let serviceProviderMock: any;
  let sessionServiceMock: any;
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
      consume: jest.fn(),
    };
    serviceProviderMock = { getById: jest.fn() };
    sessionServiceMock = {
      getId: jest.fn(),
      getDataFromBackend: jest.fn(),
    };
    res = { render: jest.fn(), redirect: jest.fn() } as unknown as Response;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrossDeviceAuthenticationController],
      providers: [
        CrossDeviceAuthenticationService,
        ServiceProviderAdapterMongoService,
        CsrfService,
        ConfigService,
        SessionService,
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
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
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
        ip: "203.0.112.7",
        headers: { "user-agent": "Mozilla/5.0" },
      } as unknown as Request;

      await controller.initiateCrossDeviceAuthentication(res, req, userSession);

      expect(
        crossDeviceAuthenticationServiceMock.findOrCreateRequest,
      ).toHaveBeenCalledWith({
        ip: "203.0.112.7",
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

  describe("continueCrossDeviceAuthentication()", () => {
    const requesterSession = {
      get: jest.fn().mockReturnValue({
        browsingSessionId: "requester-browsing-session-id",
        idpLoginHint: "User@Example.com",
        idpId: "rie-idp-id",
        interactionId: "interaction-id",
      }),
      set: jest.fn(),
      duplicate: jest.fn(),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;
    const reviewerUserSession = {
      browsingSessionId: "reviewer-browsing-session-id",
      idpId: "rie-idp-id",
      idpName: "RIE IdP",
      idpLabel: "RIE",
      idpAcr: "eidas1",
      idpAmr: ["pwd"],
      idpIdentity: { email: "user@example.com" },
      spIdentity: { sub: "account-sub", email: "user@example.com" },
      isEmailVerifiedByPcf: true,
      idpIdToken: "reviewer-id-token",
    };

    beforeEach(() => {
      crossDeviceAuthenticationServiceMock.consume.mockResolvedValue({
        reviewerSessionId: "reviewer-session-id",
      });
      sessionServiceMock.getDataFromBackend.mockResolvedValue({
        User: reviewerUserSession,
      });
      (validate as jest.Mock).mockResolvedValue([]);
    });

    it("should share the identity of the reviewer with the requester and redirect to the verify step", async () => {
      await controller.continueCrossDeviceAuthentication(
        res,
        "request-id",
        requesterSession,
      );

      expect(crossDeviceAuthenticationServiceMock.consume).toHaveBeenCalledWith(
        {
          requestId: "request-id",
          browsingSessionId: "requester-browsing-session-id",
        },
      );
      expect(sessionServiceMock.getDataFromBackend).toHaveBeenCalledWith(
        "reviewer-session-id",
      );
      expect(requesterSession.duplicate).toHaveBeenCalled();
      expect(requesterSession.set).toHaveBeenCalledWith({
        idpId: "rie-idp-id",
        idpName: "RIE IdP",
        idpLabel: "RIE",
        idpAcr: "eidas1",
        idpAmr: ["pwd"],
        idpIdentity: { email: "user@example.com" },
        spIdentity: { sub: "account-sub", email: "user@example.com" },
        isEmailVerifiedByPcf: true,
        isCrossDeviceAuthenticated: true,
        idpNonce: null,
        idpState: null,
        idpAuthorizationUrl: null,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/api/v2/interaction/interaction-id/verify",
      );
    });

    it("should throw when no approved request of the browsing session matches", async () => {
      crossDeviceAuthenticationServiceMock.consume.mockResolvedValue(null);

      await expect(
        controller.continueCrossDeviceAuthentication(
          res,
          "request-id",
          requesterSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(requesterSession.set).not.toHaveBeenCalled();
    });

    it("should throw when the request has no session of its reviewer anymore", async () => {
      crossDeviceAuthenticationServiceMock.consume.mockResolvedValue({
        reviewerSessionId: null,
      });

      await expect(
        controller.continueCrossDeviceAuthentication(
          res,
          "request-id",
          requesterSession,
        ),
      ).rejects.toThrow(XdaReviewerSessionInvalid);
      expect(sessionServiceMock.getDataFromBackend).not.toHaveBeenCalled();
      expect(requesterSession.set).not.toHaveBeenCalled();
    });

    it("should throw when the session of the reviewer does not exist anymore", async () => {
      sessionServiceMock.getDataFromBackend.mockRejectedValue(
        new Error("session not found"),
      );

      await expect(
        controller.continueCrossDeviceAuthentication(
          res,
          "request-id",
          requesterSession,
        ),
      ).rejects.toThrow(XdaReviewerSessionInvalid);
      expect(requesterSession.set).not.toHaveBeenCalled();
    });

    it("should throw when the session of the reviewer is not an active session obtained without cross-device authentication", async () => {
      (validate as jest.Mock).mockResolvedValue([
        { property: "isCrossDeviceAuthenticated" },
      ]);

      await expect(
        controller.continueCrossDeviceAuthentication(
          res,
          "request-id",
          requesterSession,
        ),
      ).rejects.toThrow(XdaReviewerSessionInvalid);
      expect(requesterSession.set).not.toHaveBeenCalled();
    });

    it.each([
      { idpIdentity: { email: "other@example.com" } },
      { idpId: "other-idp-id" },
    ])(
      "should throw when the reviewer is not the requester, or comes from another IdP (%o)",
      async (reviewerDifference) => {
        sessionServiceMock.getDataFromBackend.mockResolvedValue({
          User: { ...reviewerUserSession, ...reviewerDifference },
        });

        await expect(
          controller.continueCrossDeviceAuthentication(
            res,
            "request-id",
            requesterSession,
          ),
        ).rejects.toThrow(XdaReviewerSessionInvalid);
        expect(requesterSession.set).not.toHaveBeenCalled();
      },
    );
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
      } as unknown as ISessionService<ReviewerSessionDto>;
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
    it("should return the id and the location of the requests linked to the reviewer email", async () => {
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<ReviewerSessionDto>;
      crossDeviceAuthenticationServiceMock.getNotReviewedRequests.mockResolvedValue(
        [
          {
            id: "request-id-1",
            spName: "My SP",
            device: "Firefox",
            location: "Paris, France",
          },
          {
            id: "request-id-2",
            spName: "My SP",
            device: "Chrome",
            location: "recherche en cours…",
          },
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
        notReviewedRequests: [
          { id: "request-id-1", location: "Paris, France" },
          { id: "request-id-2", location: "recherche en cours…" },
        ],
      });
    });
  });

  describe("reviewCrossDeviceAuthenticationRequest()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ReviewerSessionDto>;

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
    } as unknown as ISessionService<ReviewerSessionDto>;

    it.each([
      RequestStatus.APPROVED,
      RequestStatus.CONSUMED,
      RequestStatus.REJECTED,
    ])("should render the request page with the %s status", async (status) => {
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
    });

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
    } as unknown as ISessionService<ReviewerSessionDto>;

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
    } as unknown as ISessionService<ReviewerSessionDto>;

    it(`should set the request status to ${status} and redirect to the request page`, async () => {
      crossDeviceAuthenticationServiceMock.review.mockResolvedValue(true);
      sessionServiceMock.getId.mockReturnValue("reviewer-session-id");

      await controller[method](res, "request-id", userSession);

      expect(crossDeviceAuthenticationServiceMock.review).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
        status,
        reviewerSessionId: "reviewer-session-id",
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
