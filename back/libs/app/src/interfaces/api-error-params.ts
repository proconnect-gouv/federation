import { Response } from 'express';

import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@fc/exceptions/exceptions';

export interface ApiErrorParams {
  exception: BaseException;
  error: { code: string; id: string; message: string };
  httpResponseCode: HttpStatus;
  res: Response;
  idpName?: string;
  spName?: string;
  errorDetail: string;
}
