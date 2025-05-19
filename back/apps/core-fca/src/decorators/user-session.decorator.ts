import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Class } from 'type-fest';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { NestJsDependencyInjectionWrapper } from '@fc/common';
import { CoreFcaSession, UserSession } from '@fc/core-fca/dto';
import { SessionInvalidSessionException } from '@fc/session';
import { ISessionService } from '@fc/session/interfaces';
import { SessionService } from '@fc/session/services';

export const UserSessionDecoratorFactory = async (
  mandatoryPropertiesDto: Class<unknown>,
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

  if (mandatoryPropertiesDto) {
    const object = plainToInstance(mandatoryPropertiesDto, sessionData);
    const mandatoryPropertiesErrors = await validate(object as object);

    if (mandatoryPropertiesErrors.length) {
      console.debug({ sessionValidationErrors: mandatoryPropertiesErrors });
      throw new SessionInvalidSessionException(
        'UserSessionDecorator: Session data is invalid.',
      );
    }
  }

  const object = plainToInstance(UserSession, sessionData);
  const typeErrors = await validate(object as object);

  if (typeErrors.length) {
    console.debug({ sessionValidationErrors: typeErrors });
    throw new SessionInvalidSessionException(
      'UserSessionDecorator: Session data is invalid.',
    );
  }

  return boundSessionService;
};

export const UserSessionDecorator = createParamDecorator(
  UserSessionDecoratorFactory,
);
