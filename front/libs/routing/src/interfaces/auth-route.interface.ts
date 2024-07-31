/* istanbul ignore file */

// declarative file
import type { Location } from 'react-router-dom';

export interface AuthRoutePropsInterface {
  replace?: boolean;
  fallback?: string | ((location: Location) => string);
}
