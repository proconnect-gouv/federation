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
    crispLink:
      'https://proconnect.crisp.help/fr/article/code-y000404-page-non-trouvee-780rbt/',
  },
  [HttpStatus.BAD_REQUEST]: {
    crispLink:
      'https://proconnect.crisp.help/fr/article/code-y000400-requete-invalide-1hxxwn4/',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    crispLink:
      'https://proconnect.crisp.help/fr/article/code-y000500-erreur-technique-interne-1l1ggn/',
  },
};
