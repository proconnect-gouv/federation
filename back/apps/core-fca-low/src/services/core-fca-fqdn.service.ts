import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { AppConfig } from '../dto';
import { SpAuthorizedFqdnsDetails } from '../interfaces';

@Injectable()
export class CoreFcaFqdnService {
  constructor(private readonly config: ConfigService) {}

  getSpAuthorizedFqdnsDetails(spId: string): SpAuthorizedFqdnsDetails | null {
    const { spAuthorizedFqdnsConfigs } = this.config.get<AppConfig>('App');

    return (
      spAuthorizedFqdnsConfigs.find((config) => {
        return config.spId === spId;
      }) || null
    );
  }
}
