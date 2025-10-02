import { ArgumentsHost } from '@nestjs/common';

import { BaseException } from '@fc/base-exception';

export class ExceptionOccurredCommand {
  constructor(
    public readonly exception: BaseException,
    public readonly host: ArgumentsHost,
  ) {}
}
