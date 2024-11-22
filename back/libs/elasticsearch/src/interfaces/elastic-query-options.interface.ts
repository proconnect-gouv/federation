/* istanbul ignore file */

import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

// Declarative code
export interface ElasticQueryOptionsInterface {
  offset?: number;
  size?: number;
  order?: SortOrder;
}
