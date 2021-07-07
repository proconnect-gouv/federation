import ErrorPage from '../pages/error.page';
import Homepage from '../pages/home.page';
import NotFoundPage from '../pages/not-found.page';
import TracesPage from '../pages/traces.page';

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
    path: '/mes-connexions',
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
