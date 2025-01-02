import classnames from 'classnames';
import React from 'react';
import { Helmet } from 'react-helmet-async';

import { useStylesQuery, useStylesVariables } from '@fc/styles';
import { UserPreferencesComponent } from '@fc/user-preferences';

import { UserPreferencesIntroductionComponent } from '../../components';

export const UserPreferencesPage = React.memo(() => {
  const [breakpointLg] = useStylesVariables(['breakpoint-lg']);

  const gtDesktop = useStylesQuery({ minWidth: breakpointLg });

  return (
    <React.Fragment>
      <Helmet>
        <title>Mon tableau de bord - Mes Accès</title>
      </Helmet>
      <div
        className={classnames('fr-m-auto fr-px-2w', {
          // Class CSS
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fr-mt-5w': !gtDesktop,
          // Class CSS
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fr-mt-8w': gtDesktop,
        })}
        id="page-container">
        <UserPreferencesComponent />
        <UserPreferencesIntroductionComponent />
      </div>
    </React.Fragment>
  );
});

UserPreferencesPage.displayName = 'UserPreferencesPage';
