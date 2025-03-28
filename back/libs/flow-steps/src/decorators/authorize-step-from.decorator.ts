import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA } from '../tokens';

export const AuthorizeStepFrom = (routes: string[]) =>
  SetMetadata(FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA, routes);

AuthorizeStepFrom.get = function (
  reflector: Reflector,
  ctx: ExecutionContext,
): string[] {
  return reflector.get<string[]>(
    FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA,
    ctx.getHandler(),
  );
};
