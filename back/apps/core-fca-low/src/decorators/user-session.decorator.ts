import { NestJsDependencyInjectionWrapper } from "#libs/common";
import { ISessionService } from "#libs/session/interfaces/index";
import { SessionService } from "#libs/session/services/index";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Class } from "type-fest";
import { CoreFcaSession, UserSession } from "../dto";
import { InvalidSessionException } from "../exceptions";

interface UserSessionDecoratorOptions {
  userSessionDto?: Class<UserSession>;
  exception?: Class<Error, [string]>;
}

export const UserSessionDecoratorFactory = async (
  {
    userSessionDto = UserSession,
    exception = InvalidSessionException,
  }: UserSessionDecoratorOptions = {},
  ctx: ExecutionContext,
): Promise<ISessionService<UserSession>> => {
  const sessionService =
    NestJsDependencyInjectionWrapper.get<SessionService>(SessionService);

  const res = ctx.switchToHttp().getResponse();

  const boundSessionService = {
    get: sessionService.get.bind(sessionService, "User"),
    set: sessionService.set.bind(sessionService, "User"),
    commit: sessionService.commit.bind(sessionService),
    duplicate: () => {
      const data = sessionService.get.bind(sessionService);
      const cleanedData = plainToInstance(CoreFcaSession, data, {
        excludeExtraneousValues: true,
      });
      sessionService.set.bind(sessionService, cleanedData);
      return sessionService.duplicate.bind(sessionService, res)();
    },
    clear: sessionService.clear.bind(sessionService),
    destroy: sessionService.destroy.bind(sessionService, res),
  } as ISessionService<UserSession>;

  const sessionData = boundSessionService.get();

  const object = plainToInstance(userSessionDto, sessionData);
  const validationErrors = await validate(object as object);

  if (validationErrors.length) {
    throw new exception(validationErrors.toString());
  }

  return boundSessionService;
};

const UserSessionParamDecorator = createParamDecorator(
  UserSessionDecoratorFactory,
);

export const UserSessionDecorator = (
  userSessionDto?: Class<UserSession>,
  exception?: Class<Error, [string]>,
) => UserSessionParamDecorator({ userSessionDto, exception });
