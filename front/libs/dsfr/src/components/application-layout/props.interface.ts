import { RouteItem } from '@fc/routing';

export interface LayoutConfig {
  logo: any;
  bottomLinks: any[];
  footerDescription: string;
  footerLinkTitle: string;
}

export interface ApplicationLayoutProps {
  routes: RouteItem[];
  config: LayoutConfig;
}
