import { Request, Response } from 'express';
import { cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';

import { SessionConfig } from '../dto';
import { SessionCannotCommitUndefinedSession } from '../exceptions';
import { SessionBackendStorageService } from './session-backend-storage.service';
import { SessionCookiesService } from './session-cookies.service';
import { SessionLocalStorageService } from './session-local-storage.service';

@Injectable()
export class SessionLifecycleService {
  constructor(
    private readonly config: ConfigService,
    private readonly cryptography: CryptographyService,
    private readonly localStorage: SessionLocalStorageService,
    private readonly backendStorage: SessionBackendStorageService,
    private readonly cookies: SessionCookiesService,
  ) {}

  init(res: Response): string {
    const { sessionIdLength } = this.config.get<SessionConfig>('Session');
    const sessionId: string =
      this.cryptography.genRandomString(sessionIdLength);

    this.localStorage.setStore({
      data: {
        User: {
          browsingSessionId: uuid(),
        },
      },
      id: sessionId,
      sync: false,
    });

    this.cookies.set(res, sessionId);

    return sessionId;
  }

  async initCache(sessionId: string): Promise<void> {
    const store = this.localStorage.getStore();

    if (store.id === sessionId && store.sync) {
      return;
    }

    const data = await this.backendStorage.get(sessionId);

    this.localStorage.setStore({
      data,
      id: sessionId,
      sync: true,
    });
  }

  clear(): void {
    const { id, data } = this.localStorage.getStore();

    this.localStorage.setStore({
      data: {
        User: {
          browsingSessionId: data?.User?.browsingSessionId || uuid(),
        },
      },
      id,
      sync: false,
    });
  }

  async duplicate(res: Response) {
    // Commit any pending changes
    await this.commit();

    // Fetch current session data
    const { data } = cloneDeep(this.localStorage.getStore());

    // Init new session
    const newSessionId = this.init(res);

    this.localStorage.setStore({
      data,
      id: newSessionId,
      sync: false,
    });

    return data;
  }

  async refresh(req: Request, res: Response): Promise<string> {
    const { lifetime } = this.config.get<SessionConfig>('Session');

    const sessionId = this.cookies.get(req);

    await this.backendStorage.expire(sessionId, lifetime);

    this.cookies.set(res, sessionId);

    return sessionId;
  }

  async destroy(res: Response) {
    const { id } = this.localStorage.getStore();

    this.cookies.remove(res);

    return await this.backendStorage.remove(id);
  }

  async commit(): Promise<boolean> {
    const { data, id, sync } = this.localStorage.getStore();

    if (!id) {
      throw new SessionCannotCommitUndefinedSession();
    }

    if (!sync) {
      const status = await this.backendStorage.save(id, data);

      this.localStorage.setStore({
        data,
        id,
        sync: status,
      });

      return status;
    }

    return true;
  }
}
