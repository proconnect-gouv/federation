//

import type { SingleValidationHandler } from '@gouvfr-lasuite/proconnect.debounce/api';

import type { Type } from '@nestjs/common';

export const SINGLE_VALIDATION_TOKEN: Type<SingleValidationHandler> =
  Symbol.for('SingleValidation') as any;
