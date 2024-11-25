/* istanbul ignore file */

// declarative file
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { VersionsService } from '@fc/core-partners';
import { ApplicationLayout } from '@fc/layout';
import { AuthedRoute, RouterErrorBoundaryComponent, UnauthedRoute } from '@fc/routing';

import { RouteLoaderDataIds } from '../enums';
import { PageLayout } from './layouts';
import { HomePage, LoginPage, VersionCreatePage, VersionsPage, VersionUpdatePage } from './pages';

export const ApplicationRoutes = React.memo(() => {
  const routes = createRoutesFromElements(
    <Route element={<ApplicationLayout />} errorElement={<RouterErrorBoundaryComponent />} path="/">
      <Route element={<UnauthedRoute fallback="/versions" />}>
        <Route element={<LoginPage />} path="login" />
      </Route>
      <Route element={<AuthedRoute fallback="/login" />}>
        <Route element={<PageLayout />}>
          <Route
            id={RouteLoaderDataIds.VERSION_SCHEMA}
            loader={VersionsService.loadSchema}
            path="versions">
            <Route element={<VersionCreatePage />} path="create" />
            <Route
              element={<VersionUpdatePage />}
              loader={VersionsService.read}
              path=":versionId"
            />
            <Route index element={<VersionsPage />} loader={VersionsService.loadAll} />
          </Route>
        </Route>
        <Route index element={<HomePage />} />
      </Route>
    </Route>,
  );

  const appRouter = createBrowserRouter(routes, {
    basename: '/',
  });

  return <RouterProvider router={appRouter} />;
});

ApplicationRoutes.displayName = 'ApplicationRoutes';
