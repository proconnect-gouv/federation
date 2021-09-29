import React from 'react';
import { ApplicationLayout as DsfrLayout } from '@fc/dsfr';
import { RouteItem } from '@fc/routing';
import { LayoutConfig } from '../config';

export function ApplicationLayout({
  routes,
}: {
  routes: RouteItem[];
}): JSX.Element {
  return <DsfrLayout routes={routes} config={LayoutConfig} />;
}
