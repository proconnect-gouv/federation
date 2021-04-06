/* istanbul ignore file */

// declarative file
import ErrorPage from './pages/error.page';
import Homepage from './pages/homepage';

const routes = [
  {
    component: ErrorPage,
    exact: true,
    id: 'error-page',
    path: '/api/v2/error',
    title: "Erreur lors de l'authentification",
  },
  {
    component: Homepage,
    exact: true,
    id: 'homepage',
    path: '/api/v2/interaction/:uid',
    title: '',
  },
];

export default routes;
