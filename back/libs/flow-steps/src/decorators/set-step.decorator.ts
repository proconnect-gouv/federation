import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FLOW_STEP_SET_STEP_METADATA } from '../tokens';

export const SetStep = () => SetMetadata(FLOW_STEP_SET_STEP_METADATA, true);

SetStep.get = function (reflector: Reflector, ctx: ExecutionContext): string {
  const value = reflector.get<string>(
    FLOW_STEP_SET_STEP_METADATA,
    ctx.getHandler(),
  );

  return value;
};
