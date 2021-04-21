import React from 'react';
import { Helmet } from 'react-helmet';
import {
  matchPath,
  Route,
  RouteProps,
  Switch,
  useLocation,
} from 'react-router-dom';

import { IRoute } from '../interfaces';
import NotFoundPage from '../pages/not-found.page';
import LayoutFooter from './layout-footer';
import LayoutHeader from './layout-header';

type ApplicationLayoutProps = {
  routes: IRoute[];
};

export const getDocumentTitle = (obj: IRoute | undefined): string => {
  const title = obj?.title || '';
  const splitter = (title && ' - ') || '';
  const documentTitle = `${title}${splitter}AgentConnect`;
  return documentTitle;
};

export const getCurrentRouteObjectByPath = (
  entries: IRoute[],
  locationPathname: string,
): IRoute | undefined => {
  const found = entries.find((route: RouteProps) =>
    matchPath(locationPathname, route),
  );
  return found;
};

function ApplicationLayout({ routes }: ApplicationLayoutProps): JSX.Element {
  const { pathname } = useLocation();

  const currentRouteObj = getCurrentRouteObjectByPath(routes, pathname);
  const documentTitle = getDocumentTitle(currentRouteObj);

  return (
    <div className="container-fluid p-0 d-flex flex-column h-100">
      <Helmet>
        <title>{documentTitle}</title>
      </Helmet>
      <div className="container mb-10">
        <LayoutHeader />
        <Switch>
          {routes.map(route => (
            <Route {...route} key={route.id} />
          ))}
          <Route component={NotFoundPage} path="*" title="404" />
        </Switch>
      </div>
      <LayoutFooter />
    </div>
  );
}

export default ApplicationLayout;
