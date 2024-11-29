import React from 'react';

import { VersionsListComponent } from '@fc/core-partners';
import { AlertComponentV2, Sizes, TileComponent } from '@fc/dsfr';
import { t } from '@fc/i18n';

import { useVersions } from '../../../hooks';
import { CreateButton } from '../../components';

export const VersionsPage = React.memo(() => {
  const { closeAlertHandler, hasItems, items, submitState } = useVersions();

  return (
    <div className="fr-col-12 fr-col-md-6">
      <div className="fr-col-12">
        <h1>{t('Partners.homepage.sandboxTitle')}</h1>
      </div>
      {submitState && (
        <AlertComponentV2
          title={t(submitState.message)}
          type={submitState.type}
          onClose={closeAlertHandler}
        />
      )}
      {hasItems && (
        <React.Fragment>
          <div className="fr-col-12">
            <CreateButton />
          </div>
          <div className="fr-col-12">
            <VersionsListComponent items={items} />
          </div>
        </React.Fragment>
      )}
      {!hasItems && (
        <div className="fr-col-12">
          <TileComponent
            isHorizontal
            description={t('Partners.homepage.createTileDescription')}
            link="create"
            size={Sizes.LARGE}
            title={t('Partners.homepage.createTileTitle')}
          />
        </div>
      )}
      <div className="fr-col-12">
        <TileComponent
          isHorizontal
          description={t('Partners.homepage.sandboxTileDescription')}
          link="."
          size={Sizes.LARGE}
          title={t('Partners.homepage.sandboxTileTitle')}
        />
      </div>
    </div>
  );
});

VersionsPage.displayName = 'VersionsPage';
