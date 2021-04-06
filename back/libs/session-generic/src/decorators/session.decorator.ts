import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ISessionGenericService } from '../interfaces';
import { SessionGenericService } from '../session-generic.service';

export function extractSessionFromRequest(
  moduleName: string,
  ctx: ExecutionContext,
): ISessionGenericService<unknown> {
  const request = ctx.switchToHttp().getRequest();
  const {
    sessionId,
    sessionService,
  }: {
    sessionId: string;
    sessionService: SessionGenericService;
  } = request;

  const boundSessionContext = {
    sessionId,
    moduleName,
  };

  /**
   * The binding occurs to force the "set" and "get" operations within the
   * current module (set by the decorator used in a controller)
   */
  return {
    get: sessionService.get.bind(sessionService, boundSessionContext),
    set: sessionService.set.bind(sessionService, boundSessionContext),
  };
}

export const Session = createParamDecorator(extractSessionFromRequest);
