/* istanbul ignore file */

// declarative file
import { FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

export type RoutePath = string;

export type RouteMap = {
  [key: string]: RoutePath;
};

export type NavigationItem = {
  component: FunctionComponent;
  id?: string;
  path: RoutePath;
  order?: number;
  label?: string;
  exact?: boolean;
};

export type RouteItem = NavigationItem & RouteProps;
