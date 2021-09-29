import { RouteItem } from './interfaces';

const sortRouteByPathDesc = (a: RouteItem, b: RouteItem): number => {
  if (a.path < b.path) return 1;
  if (a.path > b.path) return -1;
  return 0;
};

export default sortRouteByPathDesc;
