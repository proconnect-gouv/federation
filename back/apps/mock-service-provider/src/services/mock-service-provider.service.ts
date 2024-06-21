import { lastValueFrom } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

@Injectable()
export class MockServiceProviderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async getData(
    apiUrl: string,
    accessToken: string,
    authSecret: string,
  ): Promise<unknown> {
    const bearer = Buffer.from(accessToken, 'utf-8').toString('base64');

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          apiUrl,
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            auth_secret: authSecret,
          },
          {
            headers: {
              Authorization: `Bearer ${bearer}`,
            },
            proxy: false,
          },
        ),
      );

      return response.data;
    } catch (exception) {
      this.logger.err(exception);
      throw exception.response.data;
    }
  }
}
