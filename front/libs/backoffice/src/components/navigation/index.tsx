import React from 'react';
import { NavLink } from 'react-router-dom';

import { RouteItem } from '@fc/routing';

import {
  filterRouteHasOrderProperty,
  sortNavigationRouteByOrder,
} from './utils';

import './index.scss';

type NavigationProps = {
  routes: RouteItem[];
};

export const NavigationComponent = React.memo(({ routes }: NavigationProps) => {
  return (
    <div
      className="navigation flex-columns flex-around items-center"
      id="navigation"
    >
      {routes
        .filter(filterRouteHasOrderProperty)
        .sort(sortNavigationRouteByOrder)
        .map(item => (
          <NavLink key={item.id} className="button p12" to={item.path}>
            {item.label}
          </NavLink>
        ))}
    </div>
  );
});

NavigationComponent.displayName = 'NavigationComponent';
