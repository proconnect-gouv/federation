import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

@Injectable()
export class HttpProxyService {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {}
}
