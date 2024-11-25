/* istanbul ignore file */

// declarative file
import type { PartnersConfig } from '@fc/core-partners';

export const Partners: PartnersConfig = {
  endpoints: {
    instances: '/api/instances',
    versions: '/api/versions',
  },
  schemas: {
    versions: '/api/versions/form-metadata',
  },
};
