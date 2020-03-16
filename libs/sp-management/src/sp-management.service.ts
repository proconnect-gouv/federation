import { Injectable } from '@nestjs/common';
import { SPMetadata, ISpManagementService } from '@fc/oidc-provider';

@Injectable()
export class SpManagementService implements ISpManagementService {
  /**
   * @TODO implement real code...
   */
  async isUsable(clientId: string): Promise<boolean> {
    return Promise.resolve(!!clientId);
  }

  async getList(): Promise<SPMetadata[]> {
    return Promise.resolve([
      {
        // Temporary hard coded `oidc-provider` defined properties
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
        // Temporary hard coded `oidc-provider` defined properties
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_secret:
          'a970fc88b3111fcfdce515c2ee03488d8a349e5379a3ba2aa48c225dcea243a5',
        // Temporary hard coded `oidc-provider` defined properties
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uris: [
          'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
        ], // + other client properties
      },
    ]);
  }
}
