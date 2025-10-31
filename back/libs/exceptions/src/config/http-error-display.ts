import { HttpStatus } from '@nestjs/common';

import { ErrorPageParams } from '@fc/exceptions/types';

export const httpErrorDisplays: {
  [key in HttpStatus]?: ErrorPageParams['exceptionDisplay'];
} = {
  [HttpStatus.NOT_FOUND]: {
    title: 'Page non trouvée',
    description:
      'Nous n’arrivons pas à trouver la page que vous souhaitez afficher.',
    displayContact: false,
    contactMessage: undefined,
    contactHref: undefined,
    illustration: 'default-error',
  },
};
