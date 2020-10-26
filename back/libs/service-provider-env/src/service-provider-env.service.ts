import { Injectable } from '@nestjs/common';
import {
  ServiceProviderMetadata,
  IServiceProviderService,
} from '@fc/oidc-provider';
import { ConfigService } from '@fc/config';
import { ServiceProviderEnvConfig } from './dto';

@Injectable()
export class ServiceProviderEnvService implements IServiceProviderService {
  constructor(private readonly config: ConfigService) {}

  async getList(): Promise<ServiceProviderMetadata[]> {
    const configuredSp = this.config.get<ServiceProviderEnvConfig>(
      'ServiceProviderEnv',
    ) as ServiceProviderMetadata;

    return [configuredSp];
  }

  async getById(id: string): Promise<ServiceProviderMetadata> {
    const list = await this.getList();
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return list.find(({ client_id: dbId }) => dbId === id);
  }
}
