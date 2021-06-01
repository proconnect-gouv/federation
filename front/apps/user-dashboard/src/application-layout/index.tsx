import React from 'react';
import { Helmet } from 'react-helmet';
import {
  matchPath,
  Route,
  RouteProps,
  Switch,
  useLocation,
} from 'react-router-dom';

import routes from '../configs/routes';
import { IRoute } from '../interfaces';
import NotFoundPage from '../pages/not-found.page';
import LayoutFooter from './layout-footer';
import LayoutHeader from './layout-header';

const getDocumentTitle = (obj: IRoute) => {
  return `${obj && obj.title ? `${obj.title} - ` : ''}`;
};

const getCurrentRouteObjectByPath = (
  entries: IRoute[],
  locationPathname: string
) => {
  return (
    (entries &&
      entries.filter(
        obj => obj && matchPath(locationPathname, obj as RouteProps)
      )[0]) ||
    null
  );
};

function ApplicationLayout(): JSX.Element {
  const { pathname } = useLocation();

  const currentRouteObj = getCurrentRouteObjectByPath(routes, pathname);
  const documentTitle = getDocumentTitle(currentRouteObj);

  return (
    <div id="wrap">
      <div className="container clear-top" id="root">
        <Helmet>
          <title>{documentTitle}</title>
        </Helmet>
        <LayoutHeader />
        <Switch>
          {routes.map(route => (
            <Route {...route} key={route.path} />
          ))}
          <Route component={NotFoundPage} path="*" title="404" />
        </Switch>
      </div>
      <LayoutFooter />
    </div>
  );
}

export default ApplicationLayout;
