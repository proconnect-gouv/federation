import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TrackedEvent } from '@fc/tracking/enums';

import { TRACKING_TRACK_METADATA } from '../tokens';

export const Track = (event: TrackedEvent) =>
  SetMetadata(TRACKING_TRACK_METADATA, event);

/* istanbul ignore next */
Track.get = function (
  reflector: Reflector,
  ctx: ExecutionContext,
): TrackedEvent {
  return reflector.get<TrackedEvent>(TRACKING_TRACK_METADATA, ctx.getHandler());
};
