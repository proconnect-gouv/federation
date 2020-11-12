/* istanbul ignore file */
import ErrorPage from '../pages/error.page';
import Homepage from '../pages/home.page';

const routes = [
  {
    component: ErrorPage,
    exact: true,
    path: '/error',
    title: "Erreur lors de l'authentification",
  },
  {
    component: Homepage,
    exact: true,
    path: '/',
    title: '',
  },
];

export default routes;
