import React from 'react';
import { Helmet } from 'react-helmet';
import {
  matchPath,
  Route,
  RouteProps,
  Switch,
  useLocation,
} from 'react-router-dom';

import routes from '../../configs/routes';
import { IRoute } from '../../interfaces';
import LayoutFooter from './layout-footer';
import LayoutHeader from './layout-header';

const getDocumentTitle = (obj: IRoute) =>
  `${obj && obj.title ? `${obj.title} - ` : ''}`;

const getCurrentRouteObjectByPath = (
  entries: IRoute[],
  locationPathname: string,
) =>
  (entries &&
    entries.filter(
      obj => obj && matchPath(locationPathname, obj as RouteProps),
    )[0]) ||
  null;

function ApplicationLayout(): JSX.Element {
  const { pathname } = useLocation();

  const currentRouteObj = getCurrentRouteObjectByPath(routes, pathname);
  const documentTitle = getDocumentTitle(currentRouteObj);

  return (
    <div className="sticky-body">
      <div className="sticky-content">
        <Helmet>
          <title>{documentTitle}</title>
        </Helmet>
        <LayoutHeader type="franceconnect" />
        <Switch>
          {routes.map(route => (
            <Route {...route} key={route.path} />
          ))}
        </Switch>
      </div>
      <LayoutFooter
        bottomLinks={[
          {
            a11y: 'Plan du site',
            href: 'https://franceconnect.gouv.fr/plan-site',
            label: 'Plan du site',
          },
          {
            a11y: 'Accesibilité',
            href: 'https://franceconnect.gouv.fr/accessibilite',
            label: 'Accesibilité',
          },
          {
            a11y: 'Mentions légales',
            href: 'https://franceconnect.gouv.fr/mentions-legales',
            label: 'Mentions légales',
          },
          {
            a11y: 'Données personnelles',
            href: 'https://franceconnect.gouv.fr/cgu',
            label: 'Données personnelles',
          },
          {
            a11y: 'Gestion des cookies',
            href: 'https://franceconnect.gouv.fr/cgu',
            label: 'Gestion des cookies',
          },
        ]}
        description="FranceConnect est un dispositif qui permet aux internautes de s’identifier sur un service en ligne par l’intermédiaire d’un compte existant (impots.gouv.fr, ameli.fr…)."
        topLinks={[
          {
            a11y: 'Accèder au site legifrance.gouv.fr nouvelle fenêtre',
            href: 'https://www.legifrance.gouv.fr',
            label: 'legifrance.gouv.fr',
          },
          {
            a11y: 'Accèder au site gouvernement.fr nouvelle fenêtre',
            href: 'https://www.gouvernement.fr',
            label: 'gouvernement.fr',
          },
          {
            a11y: 'Accèder au site service-public.fr nouvelle fenêtre',
            href: 'https://www.service-public.fr/',
            label: 'service-public.fr',
          },
          {
            a11y: 'Accèder au site data.gouv.fr nouvelle fenêtre',
            href: 'https://data.gouv.fr',
            label: 'data.gouv.fr',
          },
        ]}
        type="franceconnect"
      />
    </div>
  );
}

export default ApplicationLayout;
