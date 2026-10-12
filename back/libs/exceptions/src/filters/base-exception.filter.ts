import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import { SessionService } from "#libs/session";
import { AppConfig } from "#src/dto/index";
import { UserSession } from "#src/dto/user-session/user-session.dto";
import { Routes } from "#src/enums/routes.enum";
import { ArgumentsHost, Catch, Injectable } from "@nestjs/common";
import { BaseExceptionFilter as NestBaseExceptionFilter } from "@nestjs/core";
import { Response } from "express";
import { ExceptionsConfig } from "../dto";
import { BaseException, EnrichedDisplayBaseException } from "../exceptions";
import {
  generateErrorId,
  getCauseChain,
  getCode,
  getDefaultContactHref,
  getStackTraceArray,
} from "../helpers";
import { ErrorPageParams } from "../types";

@Catch(BaseException)
@Injectable()
export class BaseExceptionFilter extends NestBaseExceptionFilter<BaseException> {
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: BaseException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();
    const message = exception.message;

    this.logException(code, id, message, exception);

    this.errorOutput({
      error: { code: `${code} (${exception.constructor.name})`, id, message },
      exception,
      res,
    });
  }

  protected getExceptionCodeFor(exception: BaseException): string {
    const { prefix } = this.config.get<ExceptionsConfig>("Exceptions");

    return getCode(exception.scope, exception.code, prefix);
  }

  protected logException<T extends BaseException>(
    code: string,
    id: string,
    message: string,
    exception: T,
  ): void {
    const exceptionObject = {
      code,
      id,
      message,
      causes: getCauseChain(exception),
      originalError: exception.originalError,
      reason: exception.log,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode: exception.http_status_code,
    };

    this.logger.error(exceptionObject);
  }

  protected errorOutput({
    error,
    exception,
    res,
  }: {
    error: { code: string; id: string; message: string };
    exception: BaseException;
    res: Response;
  }): void {
    const { interactionId } = this.session.get<UserSession>("User");

    const { urlPrefix } = this.config.get<AppConfig>("App");
    const interactionErrorUrl = `${urlPrefix}${Routes.INTERACTION_ERROR.replace(
      ":uid",
      interactionId,
    )}?error=${encodeURIComponent(exception.error)}&error_description=${encodeURIComponent(exception.error_description)}`;

    const errorPageParams: ErrorPageParams = {
      error,
      exceptionDisplay: {},
      interactionErrorUrl,
    };

    if (exception instanceof EnrichedDisplayBaseException) {
      const idpName = this.session.get("User", "idpName");
      const spName = this.session.get("User", "spName");
      const {
        contactHref,
        title,
        description,
        displayContact,
        contactMessage,
        illustration,
        crispLink,
        mainAction,
        additionalErrorLogs,
      } = exception;
      errorPageParams.exceptionDisplay = {
        contactHref: displayContact
          ? contactHref || getDefaultContactHref(error, { spName, idpName })
          : undefined,
        title,
        description,
        displayContact,
        contactMessage,
        illustration,
        crispLink,
        mainAction,
        additionalErrorLogs,
      };
    }

    res.status(exception.http_status_code);
    res.render("error", errorPageParams);
  }
}
