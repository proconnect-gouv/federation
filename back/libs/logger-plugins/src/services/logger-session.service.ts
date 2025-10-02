import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { UserSession } from '@fc/core';
import { LoggerPluginServiceInterface } from '@fc/logger';
import { SessionService } from '@fc/session';

@Injectable()
export class LoggerSessionService implements LoggerPluginServiceInterface {
  constructor(private moduleRef: ModuleRef) {}

  getContext(): Record<string, unknown> {
    const sessionService = this.moduleRef.get(SessionService, {
      strict: false,
    });

    const sessionId = sessionService.getId();
    const { browsingSessionId } = sessionService.get<UserSession>('User') || {};

    const context = {
      sessionId,
      browsingSessionId,
    };

    return context;
  }
}
