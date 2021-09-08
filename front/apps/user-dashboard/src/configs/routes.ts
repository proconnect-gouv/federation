import NotFoundPage from '../ui/pages/404.page';
import ErrorPage from '../ui/pages/error.page';
import Homepage from '../ui/pages/home.page';
import TracesPage from '../ui/pages/traces/page';

const routes = [
  {
    component: ErrorPage,
    exact: true,
    path: '/error',
    title: "User Dashboard - Erreur lors de l'authentification",
  },
  {
    component: TracesPage,
    exact: true,
    path: '/history',
    title: 'User Dashboard - Traces',
  },
  {
    component: Homepage,
    exact: true,
    path: '/',
    title: 'User Dashboard',
  },
  {
    component: NotFoundPage,
    exact: true,
    path: '*',
    title: '404',
  },
];

export default routes;
