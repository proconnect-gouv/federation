/* istanbul ignore file */

// Tested by DTO
import { CoreConfig } from '@fc/core';
import App from './app';

export default {
  /**
   * @TODO #253
   * ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/253
   */
  Core: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
  },
  App
} as CoreConfig;
