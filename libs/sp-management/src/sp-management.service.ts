import { Injectable } from '@nestjs/common';
import { ISpManagementService } from '@fc/oidc-provider';

@Injectable()
export class SpManagementService implements ISpManagementService {
  /**
   * @TODO implement real code...
   */
  async isUsable(clientId: string): Promise<boolean> {
    return Promise.resolve(!!clientId);
  }
}
