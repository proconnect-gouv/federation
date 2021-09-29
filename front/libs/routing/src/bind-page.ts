import { FunctionComponent } from 'react';
import { NavigationItem, RoutePath } from './interfaces';

export type bindPageOptions = {
  order?: number;
  label?: string;
};

export function bindPage(
  path: RoutePath,
  page: FunctionComponent,
  options: bindPageOptions = {},
): NavigationItem {
  const { order, label } = options;
  return {
    component: page,
    id: page.displayName,
    path,
    order,
    label,
  };
}
