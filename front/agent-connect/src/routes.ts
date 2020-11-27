/* istanbul ignore file */
// declarative file
import ErrorPage from './pages/error.page';
import Homepage from './pages/home.page';

const routes = [
  {
    component: ErrorPage,
    exact: true,
    id: 'error-page',
    path: '/error',
    title: "Erreur lors de l'authentification",
  },
  {
    component: Homepage,
    exact: true,
    id: 'homepage',
    /* @TODO ETQ Ops, je peux déployer une image docker d'AgentConnect
     * Pouvoir faire cohabiter l'url '/interaction/:interactionId' (docker) et '/api/v2/interaction/:interactionId' (prod)
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/223 */
    path: '/interaction/:interactionId',
    title: '',
  },
];

export default routes;
