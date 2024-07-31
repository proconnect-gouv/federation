/* istanbul ignore file */

// declarative file
import type { SVGComponent } from '@fc/assets';

export interface LayoutService {
  name?: string;
  homepage: string;
  baseline?: string;
  logo: SVGComponent;
}
