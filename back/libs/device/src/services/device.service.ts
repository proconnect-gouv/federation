import { Request, Response } from 'express';

import { Injectable } from '@nestjs/common';

import { IOidcIdentity } from '@fc/oidc';
import { SessionService } from '@fc/session';

import { DeviceSession } from '../dto';
import { DeviceInformationInterface } from '../interfaces';
import { DeviceCookieService } from './device-cookie.service';
import { DeviceEntriesService } from './device-entries.service';
import { DeviceHeaderFlagsService } from './device-header-flags.service';
import { DeviceInformationService } from './device-information.service';

@Injectable()
export class DeviceService {
  // Allowed fo DI in constructors
  // eslint-disable-next-line max-params
  constructor(
    private readonly session: SessionService,
    private readonly cookie: DeviceCookieService,
    private readonly entries: DeviceEntriesService,
    private readonly infos: DeviceInformationService,
    private readonly headerFlags: DeviceHeaderFlagsService,
  ) {}

  async update(
    req: Request,
    res: Response,
    identity: Partial<Omit<IOidcIdentity, 'sub'>>,
  ): Promise<DeviceInformationInterface> {
    const { s: deviceSalt, e: oldEntries } = await this.cookie.get(req);

    // Compute new informations
    const entry = this.entries.generate(identity, deviceSalt, oldEntries);
    const newEntries = this.entries.push(oldEntries, entry);

    // Extract modification informations
    const report = this.infos.extract(entry, oldEntries, newEntries);

    // Update persisted informations
    const { isTrusted, accountCount } = report;
    this.session.set('Device', { isTrusted, accountCount });
    this.cookie.set(res, { s: deviceSalt, e: newEntries });

    return report;
  }

  async initSession(req: Request) {
    const isSuspicious = this.headerFlags.isSuspicious(req);

    const deviceInfos = await this.cookie.get(req);
    const isTrusted = this.infos.isTrusted(deviceInfos.e);

    const deviceSession: DeviceSession = {
      isTrusted,
      isSuspicious,
    };

    this.session.set('Device', deviceSession);
  }
}
