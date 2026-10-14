import { CrossDeviceAuthenticationService } from "#libs/cross-device-authentication";
import { CsrfService } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { ISessionService } from "#libs/session";
import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";
import { ActiveUserSessionDto } from "../dto/user-session/active-user-session.dto";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { XdaNotEnabled, XdaRequestNotFound } from "../exceptions";
import { CrossDeviceAuthenticationController } from "./cross-device-authentication.controller";

describe("CrossDeviceAuthenticationController", () => {
  let controller: CrossDeviceAuthenticationController;

  let crossDeviceAuthenticationServiceMock: any;
  let serviceProviderMock: any;
  let res: Response;

  beforeEach(async () => {
    crossDeviceAuthenticationServiceMock = {
      create: jest.fn(),
      getAwaitingRequests: jest.fn(),
      markAsPending: jest.fn(),
    };
    serviceProviderMock = { getById: jest.fn() };
    res = { render: jest.fn() } as unknown as Response;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrossDeviceAuthenticationController],
      providers: [
        CrossDeviceAuthenticationService,
        ServiceProviderAdapterMongoService,
        CsrfService,
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
      .compile();

    controller = module.get<CrossDeviceAuthenticationController>(
      CrossDeviceAuthenticationController,
    );
    jest.clearAllMocks();
  });

  describe("proceedToCrossDeviceAuthentication()", () => {
    const userSession = {
      get: jest.fn().mockReturnValue({
        spId: "sp-id",
        spName: "My SP",
        idpLoginHint: "user@example.com",
      }),
    } as unknown as ISessionService<AfterRedirectToRieWarningSessionDto>;

    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue({ isXdaEnabled: true });
      crossDeviceAuthenticationServiceMock.create.mockResolvedValue({
        _id: "request-id",
        emojis: ["😀", "😎", "🤖", "👾"],
      });
    });

    it("should create a request and render the proceed page", async () => {
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
      });
      expect(res.render).toHaveBeenCalledWith(
        "proceed-to-cross-device-authentication",
        {
          requestId: "request-id",
          emojis: ["😀", "😎", "🤖", "👾"],
        },
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
      expect(res.render).not.toHaveBeenCalled();
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
});
