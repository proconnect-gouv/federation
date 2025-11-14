import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Class } from 'type-fest';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { NestJsDependencyInjectionWrapper } from '@fc/common';
import { ISessionService } from '@fc/session/interfaces';
import { SessionService } from '@fc/session/services';

import { CoreFcaSession, UserSession } from '../dto';
import { InvalidSessionException } from '../exceptions';

export const UserSessionDecoratorFactory = async (
  userSessionDto: Class<UserSession> = UserSession,
  ctx: ExecutionContext,
): Promise<ISessionService<UserSession>> => {
  const sessionService =
    NestJsDependencyInjectionWrapper.get<SessionService>(SessionService);

  const res = ctx.switchToHttp().getResponse();

  const boundSessionService = {
    get: sessionService.get.bind(sessionService, 'User'),
    set: sessionService.set.bind(sessionService, 'User'),
    commit: sessionService.commit.bind(sessionService),
    duplicate: () => {
      const data = sessionService.get.bind(sessionService);
      const cleanedData = plainToInstance(CoreFcaSession, data, {
        excludeExtraneousValues: true,
      });
      sessionService.set.bind(sessionService, cleanedData);
      return sessionService.duplicate.bind(sessionService, res)();
    },
    reset: sessionService.reset.bind(sessionService, res),
    destroy: sessionService.destroy.bind(sessionService, res),
  } as ISessionService<UserSession>;

  const sessionData = boundSessionService.get();

  const object = plainToInstance(userSessionDto, sessionData);
  const validationErrors = await validate(object as object);

  if (validationErrors.length) {
    throw new InvalidSessionException(validationErrors.toString());
  }

  return boundSessionService;
};

export const UserSessionDecorator = createParamDecorator(
  UserSessionDecoratorFactory,
);
