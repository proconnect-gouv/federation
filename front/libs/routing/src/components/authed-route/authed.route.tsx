import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import type { AccountContextStateInterface } from '@fc/account';
import { AccountContext } from '@fc/account';
import { useSafeContext } from '@fc/common';

import { AuthFallbackRoutes } from '../../enums';
import type { AuthRoutePropsInterface } from '../../interfaces';

export const AuthedRoute = React.memo(
  ({ fallback = AuthFallbackRoutes.LOGIN, replace = false }: AuthRoutePropsInterface) => {
    const location = useLocation();
    const { connected, expired, ready } =
      useSafeContext<AccountContextStateInterface>(AccountContext);

    if (!ready) {
      return <div data-testid="route-authed-component-loader-div" />;
    }

    if (!connected || expired) {
      const navigateTo = typeof fallback === 'function' ? fallback(location) : fallback;
      return <Navigate replace={!!replace} state={{ from: location }} to={navigateTo} />;
    }

    return <Outlet />;
  },
);

AuthedRoute.displayName = 'AuthedRoute';
