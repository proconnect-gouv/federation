import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { FlowStepsSession } from '@fc/flow-steps';
import { AuthorizeStepFrom } from '@fc/flow-steps/decorators/authorize-step-from.decorator';
import { SessionNotFoundException, SessionService } from '@fc/session';

import {
  UndefinedStepRouteException,
  UnexpectedNavigationException,
} from '../exceptions';

@Injectable()
export class AuthorizeStepFromInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly session: SessionService,
  ) {}

  // eslint-disable-next-line complexity
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const routes = AuthorizeStepFrom.get(this.reflector, context);
    const req = context.switchToHttp().getRequest();

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const currentRoute = req.route.path.replace(urlPrefix, '');

    if (isEmpty(routes)) {
      return next.handle();
    }

    const sessionData = this.session.get<FlowStepsSession>('FlowSteps');

    console.warn({ sessionData: this.session.get() });

    if (isEmpty(sessionData)) {
      throw new SessionNotFoundException();
    }

    const { previousRoute } = sessionData;

    if (!previousRoute) {
      throw new UndefinedStepRouteException();
    }

    if (!routes.includes(previousRoute)) {
      throw new UnexpectedNavigationException(
        `Navigation from ${previousRoute} to ${currentRoute} is not allowed. Allowed origins are: ${routes.join(', ')}.`,
      );
    }

    return next.handle();
  }
}
