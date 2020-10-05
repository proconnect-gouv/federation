/* istanbul ignore file */

// Tested by DTO
import { CoreConfig } from '@fc/core';
import App from './app';

export default {
  /**
   * @todo think about a better way to handle app specific parameters
   */
  Core: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
  },
  App
} as CoreConfig;
