import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import { SessionService } from "#libs/session";
import { Response } from "express";
import { EmailVerificationService } from "../email-verification.service";
import { SendEmailFailureException } from "../exceptions";
import { EmailVerificationExceptionFilter } from "./email-verification-exception.filter";

describe("EmailVerificationExceptionFilter", () => {
  let filter: EmailVerificationExceptionFilter;

  const configMock = {} as ConfigService;
  const loggerMock = {} as LoggerService;
  const sessionMock = {
    get: jest.fn(),
  } as unknown as SessionService;
  const emailVerificationMock = {
    renderVerificationEmailTemplate: jest.fn(),
  } as unknown as EmailVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();

    filter = new EmailVerificationExceptionFilter(
      configMock,
      sessionMock,
      loggerMock,
      emailVerificationMock,
    );
  });

  it("should render verification template with the email and user message", async () => {
    const res = {} as Response;
    const exception = new SendEmailFailureException();

    (sessionMock.get as jest.Mock).mockReturnValue("john.doe@example.fr");
    (
      emailVerificationMock.renderVerificationEmailTemplate as jest.Mock
    ).mockResolvedValue("rendered");

    await (filter as any).errorOutput({
      error: { code: "E001", id: "id-1", message: "technical error" },
      exception,
      res,
    });

    expect(
      emailVerificationMock.renderVerificationEmailTemplate,
    ).toHaveBeenCalledWith(res, {
      email: "john.doe@example.fr",
      errorMessage:
        "Une erreur est survenue lors de l'envoi de l'e-mail de vérification. Veuillez réessayer plus tard.",
      hasSentVerificationEmail: false,
    });
  });
});
