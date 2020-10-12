export interface IRoute {
  path: string;
  title: string;
  exact: boolean;
  component: unknown;
}
