/* istanbul ignore file */
// declarative file
import { FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

export interface IRoute extends RouteProps {
  path: string;
  title: string;
  exact: boolean;
  component: FunctionComponent;
}
