import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RouteItem } from '@fc/routing';
import { RootState } from '@fc/oidc-client';

import {
  filterRouteHasOrderProperty,
  sortNavigationRouteByOrder,
} from './utils';

import './index.scss';

import { LoginButtonComponent, LogoutButtonComponent } from '../buttons';

type NavigationProps = {
  routes: RouteItem[];
};

export const NavigationComponent = React.memo(({ routes }: NavigationProps) => {
  const { connected } = useSelector((_: RootState) => _.userInfos);

  return (
    <nav
      className="navigation flex-columns flex-around items-center"
      id="navigation"
      role="navigation"
    >
      {routes
        .filter(filterRouteHasOrderProperty)
        .sort(sortNavigationRouteByOrder)
        .map((item) => (
          <NavLink key={item.id} className="button p12" to={item.path}>
            {item.label}
          </NavLink>
        ))}
      {!connected ? <LoginButtonComponent /> : <LogoutButtonComponent />}
    </nav>
  );
});

NavigationComponent.displayName = 'NavigationComponent';
