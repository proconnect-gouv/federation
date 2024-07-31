/* istanbul ignore file */

// declarative file
import type { NavigationLink } from '@fc/common';

export interface LayoutFooter {
  links: NavigationLink[];
  description?: string;
  navigation: NavigationLink[];
}
