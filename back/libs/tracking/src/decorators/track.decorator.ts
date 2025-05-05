import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  TRACKING_TRACK_METADATA,
} from '../tokens';

export const Track = (event: string) =>
  SetMetadata(TRACKING_TRACK_METADATA, event);

/* istanbul ignore next */
Track.get = function (
  reflector: Reflector,
  ctx: ExecutionContext,
): string {
  return reflector.get<string>(
    TRACKING_TRACK_METADATA,
    ctx.getHandler(),
  );
};
