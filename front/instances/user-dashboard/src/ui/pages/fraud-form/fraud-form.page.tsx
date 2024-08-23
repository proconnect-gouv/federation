import classnames from 'classnames';
import React from 'react';
import { Helmet } from 'react-helmet-async';

import { useStylesQuery, useStylesVariables } from '@fc/styles';

import styles from './fraud-form.module.scss';

export const FraudFormPage = React.memo(() => {
  const [breakpointLg] = useStylesVariables(['breakpoint-lg']) as unknown as string;
  const gtDesktop = useStylesQuery({ minWidth: breakpointLg });

  return (
    <React.Fragment>
      <Helmet>
        <title>Signaler une usurpation</title>
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
        <h1 className={classnames(styles.title, 'fr-h3 fr-mb-2w fr-text--bold')}>
          Signalez une usurpation d’identité
        </h1>
      </div>
    </React.Fragment>
  );
});

FraudFormPage.displayName = 'FraudFormPage';
