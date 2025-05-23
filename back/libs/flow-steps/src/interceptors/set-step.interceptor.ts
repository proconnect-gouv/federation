import { Observable, tap } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { SessionService } from '@fc/session';

import { SetStep } from '../decorators';

@Injectable()
export class SetStepInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly session: SessionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isFlowStep = SetStep.get(this.reflector, context);

    if (!isFlowStep) {
      return next.handle();
    }

    // setStep will be called after controller execution
    return next.handle().pipe(
      tap({
        next: this.setStep.bind(this, context),
        error: this.setStep.bind(this, context),
      }),
    );
  }

  private setStep(context: ExecutionContext): void {
    const req = context.switchToHttp().getRequest();

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const stepRoute = req.route.path.replace(urlPrefix, '');

    this.session.set('FlowSteps', 'previousRoute', stepRoute);
  }
}
