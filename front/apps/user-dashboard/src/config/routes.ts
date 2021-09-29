import NotFoundPage from '../ui/pages/not-found';
import ErrorPage from '../ui/pages/error';
import Homepage from '../ui/pages/home-page';
import { TracksPageComponent } from '../ui/pages/tracks';
import {
  bindPage,
  concatApplicationRoutes,
  HOMEPAGE_PATH,
  NOTFOUND_PATH,
} from '@fc/routing';

export const routes = () =>
  concatApplicationRoutes(
    bindPage(NOTFOUND_PATH, NotFoundPage),
    bindPage(HOMEPAGE_PATH, Homepage),
    [
      bindPage('/history', TracksPageComponent, {
        label: 'User Dashboard - Traces',
        order: 2,
      }),
      bindPage('/error', ErrorPage, {
        label: 'User Dashboard - Erreur',
        order: 2,
      }),
    ],
  );
