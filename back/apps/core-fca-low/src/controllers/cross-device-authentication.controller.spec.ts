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
      create: jest.fn(),
      getRequest: jest.fn(),
      getAwaitingRequests: jest.fn(),
      markAsPending: jest.fn(),
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

  describe("getProceedToCrossDeviceAuthentication()", () => {
    const userSession = {
      get: jest.fn().mockReturnValue({ spId: "sp-id", spName: "My SP" }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    it("should render the intro page with a csrf token", async () => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: true });

      await controller.getProceedToCrossDeviceAuthentication(res, userSession);

      expect(res.render).toHaveBeenCalledWith(
        "proceed-to-cross-device-authentication",
        { csrfToken: "csrf-token" },
      );
    });

    it("should refuse to render the intro page when isXdaEnabled is false for the service provider", async () => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: false });

      await expect(
        controller.getProceedToCrossDeviceAuthentication(res, userSession),
      ).rejects.toThrow(XdaNotEnabled);

      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe("proceedToCrossDeviceAuthentication()", () => {
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
      crossDeviceAuthenticationServiceMock.create.mockResolvedValue({
        _id: "request-id",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });

    it("should create a request and redirect to the waiting page", async () => {
      const req = {
        headers: { "user-agent": "Mozilla/5.0" },
      } as unknown as Request;

      await controller.proceedToCrossDeviceAuthentication(
        res,
        req,
        userSession,
      );

      expect(crossDeviceAuthenticationServiceMock.create).toHaveBeenCalledWith({
        userAgent: "Mozilla/5.0",
        spName: "My SP",
        email: "user@example.com",
        browsingSessionId: "browsing-session-id",
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/api/v2/cross-device-authentication-waiting/request-id",
      );
    });

    it("should default the user agent to an empty string when missing", async () => {
      const req = { headers: {} } as unknown as Request;

      await controller.proceedToCrossDeviceAuthentication(
        res,
        req,
        userSession,
      );

      expect(crossDeviceAuthenticationServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ userAgent: "" }),
      );
    });

    it("should refuse to create a request when isXdaEnabled is false for the service provider", async () => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: false });
      const req = { headers: {} } as unknown as Request;

      await expect(
        controller.proceedToCrossDeviceAuthentication(res, req, userSession),
      ).rejects.toThrow(XdaNotEnabled);

      expect(serviceProviderMock.getById).toHaveBeenCalledWith("sp-id");
      expect(
        crossDeviceAuthenticationServiceMock.create,
      ).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe("getCrossDeviceAuthenticationWaiting()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ browsingSessionId: "browsing-session-id" }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    it("should render the waiting page with the current status", async () => {
      crossDeviceAuthenticationServiceMock.getRequest.mockResolvedValue({
        status: RequestStatus.PENDING,
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      await controller.getCrossDeviceAuthenticationWaiting(
        res,
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.getRequest,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        browsingSessionId: "browsing-session-id",
      });
      expect(res.render).toHaveBeenCalledWith(
        "cross-device-authentication-waiting",
        {
          requestId: "request-id",
          status: RequestStatus.PENDING,
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );
    });

    it("should throw XdaRequestNotFound when the request is not bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequest.mockResolvedValue(null);

      await expect(
        controller.getCrossDeviceAuthenticationWaiting(
          res,
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);

      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe("getCrossDeviceAuthenticationStatus()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ browsingSessionId: "browsing-session-id" }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    it("should only return the status of the request bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequest.mockResolvedValue({
        status: RequestStatus.APPROVED,
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      const result = await controller.getCrossDeviceAuthenticationStatus(
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.getRequest,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        browsingSessionId: "browsing-session-id",
      });
      expect(result).toEqual({ status: RequestStatus.APPROVED });
    });

    it("should throw XdaRequestNotFound when the request is not bound to the session", async () => {
      crossDeviceAuthenticationServiceMock.getRequest.mockResolvedValue(null);

      await expect(
        controller.getCrossDeviceAuthenticationStatus(
          "request-id",
          userSession,
        ),
      ).rejects.toThrow(XdaRequestNotFound);
    });
  });

  describe("reviewCrossDeviceAuthenticationRequests()", () => {
    it("should render the requests linked to the user email", async () => {
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<ActiveUserSessionDto>;
      crossDeviceAuthenticationServiceMock.getAwaitingRequests.mockResolvedValue(
        [{ id: "request-id", spName: "My SP", device: "Firefox sur Windows" }],
      );

      await controller.reviewCrossDeviceAuthenticationRequests(
        res,
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.getAwaitingRequests,
      ).toHaveBeenCalledWith("user@example.com");
      expect(res.render).toHaveBeenCalledWith(
        "review-cross-device-authentication-requests",
        {
          csrfToken: "csrf-token",
          awaitingRequests: [
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

  describe("reviewCrossDeviceAuthenticationRequest()", () => {
    const userSession = {
      get: jest
        .fn()
        .mockReturnValue({ idpIdentity: { email: "user@example.com" } }),
    } as unknown as ISessionService<ActiveUserSessionDto>;

    it("should mark the request as pending and render its emojis", async () => {
      crossDeviceAuthenticationServiceMock.markAsPending.mockResolvedValue({
        spName: "My SP",
        device: "Firefox sur Windows",
        emojis: ["😀", "😎", "🤖", "👾"],
      });

      await controller.reviewCrossDeviceAuthenticationRequest(
        res,
        "request-id",
        userSession,
      );

      expect(
        crossDeviceAuthenticationServiceMock.markAsPending,
      ).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
      });
      expect(res.render).toHaveBeenCalledWith(
        "review-cross-device-authentication-request",
        {
          csrfToken: "csrf-token",
          requestId: "request-id",
          spName: "My SP",
          device: "Firefox sur Windows",
          emojis: ["😀", "😎", "🤖", "👾"],
        },
      );
    });

    it("should throw when no awaiting request matches for the user", async () => {
      crossDeviceAuthenticationServiceMock.markAsPending.mockResolvedValue(
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

    it(`should set the request status to ${status} and redirect to the requests list`, async () => {
      crossDeviceAuthenticationServiceMock.review.mockResolvedValue(true);

      await controller[method](res, "request-id", userSession);

      expect(crossDeviceAuthenticationServiceMock.review).toHaveBeenCalledWith({
        requestId: "request-id",
        email: "user@example.com",
        status,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/api/v2/cross-device-authentication-requests",
      );
    });

    it("should throw when the request is not pending, expired or not owned by the user", async () => {
      crossDeviceAuthenticationServiceMock.review.mockResolvedValue(false);

      await expect(
        controller[method](res, "request-id", userSession),
      ).rejects.toThrow(XdaRequestNotFound);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
