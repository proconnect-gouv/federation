/* istanbul ignore file */

// declarative file
import type { NavigationLink } from '@fc/common';

import type { LayoutFeatures } from './layout-features.interface';
import type { LayoutFooter } from './layout-footer.interface';
import type { LayoutService } from './layout-service.interface';

export interface LayoutConfig {
  navigation?: NavigationLink[];
  service: LayoutService;
  footer: LayoutFooter;
  features: LayoutFeatures;
}
