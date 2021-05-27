/* istanbul ignore file */

// Tested by DTO
import { AppConfig } from '@fc/eidas-bridge';

export default {
  name: 'EIDAS_BRIDGE',
  urlPrefix: '',
  countryIsoList: JSON.parse(process.env.App_AVAILABLE_COUNTRIES),
} as AppConfig;
